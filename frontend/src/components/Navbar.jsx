import { useState, useEffect } from "react";
import { Link } from "react-router";
import { PlusIcon, Timer, User, LogOut, LogIn, UserPlus, FileText } from "lucide-react";
import authService from "../lib/auth.service";
import guestSyncService from "../lib/guestSync.service";
import toast from "react-hot-toast";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [hasGuestNotes, setHasGuestNotes] = useState(false);

  useEffect(() => {
    // Initialize auth state
    const isAuthenticated = authService.init();
    if (isAuthenticated) {
      setUser(authService.getCurrentUser());
    }
    
    // Check for guest notes
    setHasGuestNotes(guestSyncService.hasGuestNotesToSync());
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    toast.success("Logged out successfully");
  };

  const handleSyncGuestNotes = async () => {
    try {
      const result = await guestSyncService.syncGuestNotesToUser();
      setHasGuestNotes(false);
      toast.success(result.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <header className="bg-base-300 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary font-mono tracking-tight">NotesMadeEasy</h1>
          
          <div className="flex items-center gap-4">
            <Link to={"/pomodoro"} className="btn btn-outline">
              <Timer className="size-5" />
              <span>Pomodoro</span>
            </Link>
            
            <Link to={"/pdf-upload"} className="btn btn-outline">
              <FileText className="size-5" />
              <span>PDF Upload</span>
            </Link>
            
            <Link to={"/create"} className="btn btn-primary">
              <PlusIcon className="size-5" />
              <span>New Note</span>
            </Link>

            {user ? (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost">
                  <User className="size-5" />
                  <span>{user.name}</span>
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <button onClick={handleLogout} className="flex items-center gap-2">
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {hasGuestNotes && (
                  <button 
                    onClick={handleSyncGuestNotes}
                    className="btn btn-warning btn-sm"
                    title={`Sync ${guestSyncService.getGuestNotesCount()} guest notes`}
                  >
                    Sync Notes
                  </button>
                )}
                <Link to={"/login"} className="btn btn-outline btn-sm">
                  <LogIn className="size-4" />
                  <span>Login</span>
                </Link>
                <Link to={"/register"} className="btn btn-secondary btn-sm">
                  <UserPlus className="size-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
