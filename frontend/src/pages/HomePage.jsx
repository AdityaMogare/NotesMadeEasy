import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import NotesNotFound from "../components/NotesNotFound";
import guestSyncService from "../lib/guestSync.service";
import authService from "../lib/auth.service";
import toast from "react-hot-toast";

const HomePage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Initialize auth state
        const isAuthenticated = authService.init();
        if (isAuthenticated) {
          setUser(authService.getCurrentUser());
        }

        // Load notes based on authentication status
        const notesData = await guestSyncService.getNotes();
        setNotes(notesData);
      } catch (error) {
        console.error('Error loading notes:', error);
        toast.error('Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, []);

  const handleDeleteNote = async (noteId) => {
    try {
      await guestSyncService.deleteNote(noteId);
      setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId && note.id !== noteId));
      toast.success("Note deleted successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getModeText = () => {
    if (user) {
      return `Welcome back, ${user.name}! Your notes are synced to the cloud.`;
    } else {
      return "You're in guest mode. Notes are saved locally in your browser.";
    }
  };

  const getModeIcon = () => {
    if (user) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {/* Mode Notice */}
        <div className={`alert ${user ? 'alert-success' : 'alert-info'} mb-6`}>
          {getModeIcon()}
          <span>{getModeText()}</span>
        </div>

        {loading && <div className="text-center text-primary py-10">Loading notes...</div>}

        {notes.length === 0 && !loading && <NotesNotFound />}

        {notes.length > 0 && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard 
                key={note._id || note.id} 
                note={note} 
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default HomePage;
