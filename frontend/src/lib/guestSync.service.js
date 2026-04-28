import api from './axios';
import { getNotesFromStorage, saveNotesToStorage, generateId } from './utils';

class GuestSyncService {
  constructor() {
    this.guestIdKey = 'guestId';
  }

  // Get or create guest ID
  getGuestId() {
    let guestId = localStorage.getItem(this.guestIdKey);
    if (!guestId) {
      guestId = generateId();
      localStorage.setItem(this.guestIdKey, guestId);
    }
    return guestId;
  }

  // Get guest notes from localStorage
  getGuestNotes() {
    return getNotesFromStorage();
  }

  // Sync guest notes to user account
  async syncGuestNotesToUser() {
    try {
      const guestNotes = this.getGuestNotes();
      
      if (guestNotes.length === 0) {
        return { success: true, message: 'No guest notes to sync' };
      }

      const response = await api.post('/notes/sync-guest-notes', {
        guestNotes: guestNotes
      });

      // Clear guest notes from localStorage after successful sync
      localStorage.removeItem('guestNotes');
      localStorage.removeItem(this.guestIdKey);

      return {
        success: true,
        message: response.data.message,
        syncedNotes: response.data.syncedNotes
      };
    } catch (error) {
      console.error('Error syncing guest notes:', error);
      throw new Error(error.response?.data?.message || 'Failed to sync guest notes');
    }
  }

  // Check if user has guest notes to sync
  hasGuestNotesToSync() {
    const guestNotes = this.getGuestNotes();
    return guestNotes.length > 0;
  }

  // Get guest notes count
  getGuestNotesCount() {
    const guestNotes = this.getGuestNotes();
    return guestNotes.length;
  }

  // Create a note (works for both guest and authenticated users)
  async createNote(noteData) {
    try {
      if (this.isAuthenticated()) {
        // Authenticated user - save to server
        const response = await api.post('/notes', noteData);
        return response.data;
      } else {
        // Guest user - save to localStorage
        const guestNote = {
          id: generateId(),
          ...noteData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          guestId: this.getGuestId()
        };

        const existingNotes = getNotesFromStorage();
        const updatedNotes = [guestNote, ...existingNotes];
        saveNotesToStorage(updatedNotes);

        return guestNote;
      }
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error(error.response?.data?.message || 'Failed to create note');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const sessionId = localStorage.getItem('sessionId');
    return !!sessionId;
  }

  async getNoteById(noteId) {
    try {
      if (this.isAuthenticated()) {
        const response = await api.get(`/notes/${noteId}`);
        return response.data;
      }
      const notes = await this.getNotes();
      return (
        notes.find(
          (n) => String(n._id) === String(noteId) || n.id === noteId
        ) ?? null
      );
    } catch (error) {
      console.error("Error getting note by id:", error);
      throw new Error(error.response?.data?.message || "Failed to load note");
    }
  }

  async shareNote(noteId, { email, permission }) {
    const response = await api.post(`/notes/${noteId}/share`, {
      email,
      permission,
    });
    return response.data;
  }

  async getNoteShares(noteId) {
    const response = await api.get(`/notes/${noteId}/shares`);
    return response.data;
  }

  async revokeNoteShare(noteId, userId) {
    const response = await api.delete(`/notes/${noteId}/share/${userId}`);
    return response.data;
  }

  // Get notes (works for both guest and authenticated users)
  async getNotes() {
    try {
      if (this.isAuthenticated()) {
        // Authenticated user - get from server
        const response = await api.get('/notes');
        return response.data;
      } else {
        // Guest user - get from localStorage
        return getNotesFromStorage();
      }
    } catch (error) {
      console.error('Error getting notes:', error);
      // Fallback to localStorage for guest users
      return getNotesFromStorage();
    }
  }

  // Update note (works for both guest and authenticated users)
  async updateNote(noteId, noteData) {
    try {
      if (this.isAuthenticated()) {
        // Authenticated user - update on server
        const response = await api.put(`/notes/${noteId}`, noteData);
        return response.data;
      } else {
        // Guest user - update in localStorage
        const existingNotes = getNotesFromStorage();
        const updatedNotes = existingNotes.map(note => 
          note.id === noteId 
            ? { ...note, ...noteData, updatedAt: new Date().toISOString() }
            : note
        );
        saveNotesToStorage(updatedNotes);
        
        return updatedNotes.find(note => note.id === noteId);
      }
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error(error.response?.data?.message || 'Failed to update note');
    }
  }

  // Delete note (works for both guest and authenticated users)
  async deleteNote(noteId) {
    try {
      if (this.isAuthenticated()) {
        // Authenticated user - delete from server
        await api.delete(`/notes/${noteId}`);
      } else {
        // Guest user - delete from localStorage
        const existingNotes = getNotesFromStorage();
        const updatedNotes = existingNotes.filter(note => note.id !== noteId);
        saveNotesToStorage(updatedNotes);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete note');
    }
  }
}

// Create singleton instance
const guestSyncService = new GuestSyncService();

export default guestSyncService; 