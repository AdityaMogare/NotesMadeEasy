import { PenSquareIcon, Trash2Icon, Users } from "lucide-react";
import { Link } from "react-router";
import { formatDate } from "../lib/utils";

const NoteCard = ({ note, onDelete }) => {
  const noteId = note._id || note.id;
  const isShared = note.access === "shared";
  const showDelete = !isShared;

  const handleDelete = (e, id) => {
    e.preventDefault(); // get rid of the navigation behaviour

    if (!window.confirm("Are you sure you want to delete this note?")) return;

    onDelete(id);
  };

  return (
    <Link
      to={`/note/${noteId}`}
      className="card bg-base-100 hover:shadow-lg transition-all duration-200 
      border-t-4 border-solid border-[#00FF9D]"
    >
      <div className="card-body">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-base-content flex-1 min-w-0">{note.title}</h3>
          {isShared && (
            <span className="badge badge-secondary badge-sm shrink-0 gap-1">
              <Users className="size-3" />
              Shared
            </span>
          )}
        </div>
        <p className="text-base-content/70 line-clamp-3">{note.content}</p>
        <div className="card-actions justify-between items-center mt-4">
          <span className="text-sm text-base-content/60">
            {formatDate(new Date(note.createdAt))}
          </span>
          <div className="flex items-center gap-1">
            <PenSquareIcon className="size-4" />
            {showDelete && (
              <button
                className="btn btn-ghost btn-xs text-error"
                onClick={(e) => handleDelete(e, noteId)}
              >
                <Trash2Icon className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
export default NoteCard;
