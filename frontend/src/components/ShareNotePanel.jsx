import { useState, useEffect } from "react";
import { Share2, UserX } from "lucide-react";
import guestSyncService from "../lib/guestSync.service";
import toast from "react-hot-toast";

const ShareNotePanel = ({ noteId }) => {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("read");
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadShares = async () => {
    try {
      const data = await guestSyncService.getNoteShares(noteId);
      setShares(data.shares ?? []);
    } catch (e) {
      toast.error(e.message || "Failed to load collaborators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShares();
  }, [noteId]);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter the recipient's email");
      return;
    }
    setSubmitting(true);
    try {
      await guestSyncService.shareNote(noteId, {
        email: email.trim(),
        permission,
      });
      toast.success("Note shared");
      setEmail("");
      await loadShares();
    } catch (err) {
      toast.error(err.message || "Could not share note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (userId) => {
    if (!window.confirm("Remove this person's access?")) return;
    try {
      await guestSyncService.revokeNoteShare(noteId, userId);
      toast.success("Access removed");
      setShares((prev) => prev.filter((s) => String(s.userId) !== String(userId)));
    } catch (err) {
      toast.error(err.message || "Could not remove access");
    }
  };

  return (
    <div className="border border-base-300 rounded-lg p-4 mt-6 bg-base-200/30">
      <h3 className="font-semibold flex items-center gap-2 mb-3">
        <Share2 className="size-5" />
        Share with others
      </h3>
      <p className="text-sm text-base-content/70 mb-4">
        Enter another user&apos;s account email. They must already be registered.
      </p>

      <form onSubmit={handleShare} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="email"
          className="input input-bordered input-sm flex-1"
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <select
          className="select select-bordered select-sm w-full sm:w-36"
          value={permission}
          onChange={(e) => setPermission(e.target.value)}
        >
          <option value="read">Can view</option>
          <option value="edit">Can edit</option>
        </select>
        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
          {submitting ? "Sharing…" : "Share"}
        </button>
      </form>

      <div>
        <h4 className="text-sm font-medium mb-2">People with access</h4>
        {loading ? (
          <p className="text-sm text-base-content/60">Loading…</p>
        ) : shares.length === 0 ? (
          <p className="text-sm text-base-content/60">Not shared with anyone yet.</p>
        ) : (
          <ul className="space-y-2">
            {shares.map((s) => (
              <li
                key={String(s.userId)}
                className="flex items-center justify-between gap-2 text-sm bg-base-100 rounded-md px-3 py-2 border border-base-300"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-base-content/60 truncate">{s.email}</div>
                  <div className="text-xs text-base-content/50 capitalize">{s.permission}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error shrink-0"
                  title="Remove access"
                  onClick={() => handleRevoke(s.userId)}
                >
                  <UserX className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ShareNotePanel;
