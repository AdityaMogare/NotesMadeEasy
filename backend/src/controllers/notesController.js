import Note from "../models/Note.js";

export async function getAllNotes(req, res) {
  try {
    let notes;
    
    if (req.user) {
      // Authenticated user - get their notes
      notes = await Note.findByUser(req.user.userId);
    } else {
      // Guest user - return empty array (they should use localStorage)
      notes = [];
    }
    
    res.status(200).json(notes);
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
    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }
    
    // Check if user owns this note
    if (!note.belongsToUser(req.user.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(note);
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
      content
    };
    
    if (req.user) {
      // Authenticated user
      noteData.user = req.user.userId;
    } else if (guestId) {
      // Guest user
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
    
    // Check if user owns this note
    if (!note.belongsToUser(req.user.userId)) {
      return res.status(403).json({ message: "Access denied" });
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
    
    // Check if user owns this note
    if (!note.belongsToUser(req.user.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
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
      // Check if note already exists for this user
      const existingNote = await Note.findOne({
        user: userId,
        title: guestNote.title,
        content: guestNote.content
      });
      
      if (!existingNote) {
        // Create new note for user
        const newNote = new Note({
          title: guestNote.title,
          content: guestNote.content,
          user: userId,
          createdAt: guestNote.createdAt,
          updatedAt: guestNote.updatedAt
        });
        
        const savedNote = await newNote.save();
        syncedNotes.push(savedNote);
      }
    }
    
    res.status(200).json({
      message: `${syncedNotes.length} notes synced successfully`,
      syncedNotes
    });
  } catch (error) {
    console.error("Error in syncGuestNotes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
