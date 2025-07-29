import express from "express";
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  updateNote,
  syncGuestNotes,
  getGuestNotes
} from "../controllers/notesController.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Routes that work for both guest and authenticated users
router.get("/", optionalAuthMiddleware, getAllNotes);
router.get("/guest/:guestId", getGuestNotes);

// Routes that require authentication
router.get("/:id", authMiddleware, getNoteById);
router.post("/", optionalAuthMiddleware, createNote);
router.put("/:id", authMiddleware, updateNote);
router.delete("/:id", authMiddleware, deleteNote);

// Special route for syncing guest notes to user account
router.post("/sync-guest-notes", authMiddleware, syncGuestNotes);

export default router;
