import mongoose from "mongoose";
import Note from "../models/Note.js";
import NoteShare from "../models/NoteShare.js";
import User from "../models/User.js";

async function getShareForUser(noteId, userId) {
  return NoteShare.findOne({
    note: noteId,
    sharedWith: userId,
  });
}

export async function getAllNotes(req, res) {
  try {
    if (!req.user) {
      return res.status(200).json([]);
    }

    const userId = req.user.userId;

    const ownNotes = await Note.find({
      user: userId,
      isArchived: false,
    })
      .sort({ updatedAt: -1 })
      .lean();

    const mappedOwn = ownNotes.map((n) => ({
      ...n,
      access: "owner",
      sharePermission: null,
      sharedByName: null,
      sharedByEmail: null,
    }));

    const shareDocs = await NoteShare.find({ sharedWith: userId })
      .populate({
        path: "note",
        match: { isArchived: false },
      })
      .populate("owner", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    const sharedNotes = [];
    for (const s of shareDocs) {
      if (!s.note) continue;
      sharedNotes.push({
        ...s.note,
        access: "shared",
        sharePermission: s.permission,
        sharedByName: s.owner?.name ?? null,
        sharedByEmail: s.owner?.email ?? null,
      });
    }

    const combined = [...mappedOwn, ...sharedNotes].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    res.status(200).json(combined);
  } catch (error) {
    console.error("Error in getAllNotes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getGuestNotes(req, res) {
  try {
    const { guestId } = req.params;
    const notes = await Note.findGuestNotes(guestId);
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in getGuestNotes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getNoteById(req, res) {
  try {
    const note = await Note.findById(req.params.id);
    if (!note || note.isArchived) {
      return res.status(404).json({ message: "Note not found!" });
    }

    const userId = req.user.userId;

    if (note.belongsToUser(userId)) {
      const obj = note.toObject();
      return res.json({
        ...obj,
        access: "owner",
        sharePermission: null,
        sharedByName: null,
        sharedByEmail: null,
      });
    }

    const share = await getShareForUser(note._id, userId);
    if (!share) {
      return res.status(403).json({ message: "Access denied" });
    }

    const owner = await User.findById(note.user).select("name email").lean();
    const obj = note.toObject();
    return res.json({
      ...obj,
      access: "shared",
      sharePermission: share.permission,
      sharedByName: owner?.name ?? null,
      sharedByEmail: owner?.email ?? null,
    });
  } catch (error) {
    console.error("Error in getNoteById controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createNote(req, res) {
  try {
    const { title, content, guestId } = req.body;

    const noteData = {
      title,
      content,
    };

    if (req.user) {
      noteData.user = req.user.userId;
    } else if (guestId) {
      noteData.guestId = guestId;
      noteData.isGuestNote = true;
    } else {
      return res.status(400).json({ message: "Guest ID required for guest notes" });
    }

    const note = new Note(noteData);
    const savedNote = await note.save();

    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error in createNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateNote(req, res) {
  try {
    const { title, content } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const userId = req.user.userId;

    if (!note.belongsToUser(userId)) {
      const share = await getShareForUser(note._id, userId);
      if (!share || share.permission !== "edit") {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error in updateNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteNote(req, res) {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (!note.belongsToUser(req.user.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await NoteShare.deleteMany({ note: note._id });
    await Note.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Note deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function syncGuestNotes(req, res) {
  try {
    const { guestNotes } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(guestNotes)) {
      return res.status(400).json({ message: "Guest notes must be an array" });
    }

    const syncedNotes = [];

    for (const guestNote of guestNotes) {
      const existingNote = await Note.findOne({
        user: userId,
        title: guestNote.title,
        content: guestNote.content,
      });

      if (!existingNote) {
        const newNote = new Note({
          title: guestNote.title,
          content: guestNote.content,
          user: userId,
          createdAt: guestNote.createdAt,
          updatedAt: guestNote.updatedAt,
        });

        const savedNote = await newNote.save();
        syncedNotes.push(savedNote);
      }
    }

    res.status(200).json({
      message: `${syncedNotes.length} notes synced successfully`,
      syncedNotes,
    });
  } catch (error) {
    console.error("Error in syncGuestNotes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function shareNote(req, res) {
  try {
    const note = await Note.findById(req.params.id);
    if (!note || !note.user) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (!note.belongsToUser(req.user.userId)) {
      return res.status(404).json({ message: "Note not found" });
    }

    const { email, permission = "read" } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!["read", "edit"].includes(permission)) {
      return res.status(400).json({ message: "Permission must be read or edit" });
    }

    const target = await User.findByEmail(email.trim());
    if (!target) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    if (String(target._id) === String(req.user.userId)) {
      return res.status(400).json({ message: "You cannot share a note with yourself" });
    }

    const doc = await NoteShare.findOneAndUpdate(
      { note: note._id, sharedWith: target._id },
      { owner: note.user, permission },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: "Note shared successfully",
      share: {
        userId: target._id,
        name: target.name,
        email: target.email,
        permission: doc.permission,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Share already exists" });
    }
    console.error("Error in shareNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function listNoteShares(req, res) {
  try {
    const note = await Note.findById(req.params.id);
    if (!note || !note.belongsToUser(req.user.userId)) {
      return res.status(404).json({ message: "Note not found" });
    }

    const shares = await NoteShare.find({ note: note._id })
      .populate("sharedWith", "name email")
      .sort({ createdAt: 1 })
      .lean();

    const list = shares
      .filter((s) => s.sharedWith)
      .map((s) => ({
        userId: s.sharedWith._id,
        name: s.sharedWith.name,
        email: s.sharedWith.email,
        permission: s.permission,
        sharedAt: s.createdAt,
      }));

    res.status(200).json({ shares: list });
  } catch (error) {
    console.error("Error in listNoteShares controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function revokeNoteShare(req, res) {
  try {
    const { id, userId: sharedUserId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(sharedUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const note = await Note.findById(id);
    if (!note || !note.belongsToUser(req.user.userId)) {
      return res.status(404).json({ message: "Note not found" });
    }

    const result = await NoteShare.deleteOne({
      note: note._id,
      sharedWith: sharedUserId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Share not found" });
    }

    res.status(200).json({ message: "Access removed" });
  } catch (error) {
    console.error("Error in revokeNoteShare controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
