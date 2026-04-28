import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon, FileDown } from "lucide-react";
import guestSyncService from "../lib/guestSync.service";
import { exportNoteAsMarkdown } from "../lib/exportImport.service";
import ShareNotePanel from "../components/ShareNotePanel";

const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const foundNote = await guestSyncService.getNoteById(id);

        if (!foundNote) {
          toast.error("Note not found");
          navigate("/");
          return;
        }

        setNote(foundNote);
      } catch (error) {
        console.log("Error in fetching note", error);
        toast.error("Failed to fetch the note");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, navigate]);

  const isOwner = Boolean(note && (!note.access || note.access === "owner"));
  const canEdit = Boolean(
    note &&
      (isOwner || (note.access === "shared" && note.sharePermission === "edit"))
  );
  const isSharedReadOnly = Boolean(
    note?.access === "shared" && note.sharePermission === "read"
  );

  const handleDelete = async () => {
    if (!isOwner) return;
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await guestSyncService.deleteNote(id);
      toast.success("Note deleted");
      navigate("/");
    } catch (error) {
      console.log("Error deleting the note:", error);
      toast.error(error.message);
    }
  };

  const handleExportMarkdown = () => {
    try {
      exportNoteAsMarkdown(note);
      toast.success("Note downloaded as Markdown");
    } catch (err) {
      toast.error(err.message || "Export failed");
    }
  };

  const handleSave = async () => {
    if (!canEdit) {
      toast.error("You do not have permission to edit this note");
      return;
    }
    if (!note.title.trim() || !note.content.trim()) {
      toast.error("Please add a title or content");
      return;
    }

    setSaving(true);

    try {
      await guestSyncService.updateNote(id, {
        title: note.title.trim(),
        content: note.content.trim()
      });
      
      toast.success("Note updated successfully");
      navigate("/");
    } catch (error) {
      console.log("Error saving the note:", error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <LoaderIcon className="animate-spin size-10" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Note not found</h2>
          <Link to="/" className="btn btn-primary">
            Back to Notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Notes
            </Link>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="btn btn-outline btn-secondary"
                title="Export as Markdown"
              >
                <FileDown className="h-5 w-5" />
                Export .md
              </button>
              {isOwner && (
                <button onClick={handleDelete} className="btn btn-error btn-outline">
                  <Trash2Icon className="h-5 w-5" />
                  Delete Note
                </button>
              )}
            </div>
          </div>

          {note.access === "shared" && (
            <div className="alert alert-info mb-4">
              <span>
                Shared with you by <strong>{note.sharedByName || "another user"}</strong>
                {note.sharedByEmail ? ` (${note.sharedByEmail})` : ""}.{" "}
                {isSharedReadOnly
                  ? "You can view this note but not edit it."
                  : "You can edit this note."}
              </span>
            </div>
          )}

          <div className="card bg-base-100">
            <div className="card-body">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Note title"
                  className="input input-bordered"
                  value={note.title}
                  readOnly={!canEdit}
                  onChange={(e) => setNote({ ...note, title: e.target.value })}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Content</span>
                </label>
                <textarea
                  placeholder="Write your note here..."
                  className="textarea textarea-bordered h-32"
                  value={note.content}
                  readOnly={!canEdit}
                  onChange={(e) => setNote({ ...note, content: e.target.value })}
                />
              </div>

              <div className="card-actions justify-end">
                {canEdit && (
                  <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {isOwner && guestSyncService.isAuthenticated() && (
            <ShareNotePanel noteId={note._id || id} />
          )}
        </div>
      </div>
    </div>
  );
};
export default NoteDetailPage;
