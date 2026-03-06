import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  ArrowLeftIcon,
  Download,
  Upload,
  FileJson,
  FileText,
  Settings as SettingsIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import guestSyncService from "../lib/guestSync.service";
import {
  exportAllNotesAsJson,
  importNotesFromJson,
  exportNoteAsMarkdown,
} from "../lib/exportImport.service";

const SettingsPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const loadNotes = async () => {
      try {
        const data = await guestSyncService.getNotes();
        if (!cancelled) {
          setNotes(data);
          setSelectedNoteId((prev) => prev || (data[0] ? (data[0].id || data[0]._id) : ""));
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          toast.error("Failed to load notes");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadNotes();
    return () => { cancelled = true; };
  }, []);

  const handleExportAllJson = async () => {
    setExporting(true);
    try {
      const { count, filename } = await exportAllNotesAsJson();
      toast.success(`Exported ${count} note${count !== 1 ? "s" : ""} to ${filename}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = await importNotesFromJson(parsed);

      if (!result.success) {
        toast.error(result.error || "Import failed");
        return;
      }

      if (result.imported > 0 || result.skipped > 0) {
        toast.success(
          `Imported ${result.imported} note${result.imported !== 1 ? "s" : ""}, skipped ${result.skipped} duplicate(s).`
        );
        const updated = await guestSyncService.getNotes();
        setNotes(updated);
      } else {
        toast.success("No new notes to import (file may be empty or all duplicates).");
      }
    } catch (err) {
      console.error(err);
      if (err instanceof SyntaxError) {
        toast.error("Invalid JSON file. Please choose a valid backup JSON.");
      } else {
        toast.error(err.message || "Import failed");
      }
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleExportMarkdown = () => {
    const note = notes.find((n) => (n.id || n._id) === selectedNoteId);
    if (!note) {
      toast.error("Please select a note to export.");
      return;
    }
    try {
      const { filename } = exportNoteAsMarkdown(note);
      toast.success(`Downloaded ${filename}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Export failed");
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link to="/" className="btn btn-ghost mb-6">
            <ArrowLeftIcon className="size-5" />
            Back to Notes
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <SettingsIcon className="size-8 text-primary" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Backup & Restore</h2>

              <div className="space-y-6">
                {/* Export all as JSON */}
                <div className="flex flex-wrap items-center gap-4">
                  <FileJson className="size-6 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Export all notes</p>
                    <p className="text-sm text-base-content/70">
                      Download a JSON backup of all your notes (notes_backup_date.json).
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={exporting || loading || notes.length === 0}
                    onClick={handleExportAllJson}
                  >
                    {exporting ? "Exporting…" : "Export JSON"}
                    <Download className="size-4 ml-1" />
                  </button>
                </div>

                {/* Import from JSON */}
                <div className="flex flex-wrap items-center gap-4">
                  <Upload className="size-6 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Import notes</p>
                    <p className="text-sm text-base-content/70">
                      Upload a backup JSON file. New notes are merged; duplicates are skipped.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={importing}
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-primary"
                    disabled={importing}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {importing ? "Importing…" : "Choose file"}
                    <Upload className="size-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl mt-6">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Export as Markdown</h2>
              <p className="text-sm text-base-content/70 mb-4">
                Download a single note as a .md file (e.g. for use in other apps).
              </p>
              <div className="flex flex-wrap items-end gap-4">
                <div className="form-control flex-1 min-w-[200px]">
                  <label className="label">
                    <span className="label-text">Select note</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedNoteId}
                    onChange={(e) => setSelectedNoteId(e.target.value)}
                    disabled={loading || notes.length === 0}
                  >
                    {notes.length === 0 && (
                      <option value="">No notes</option>
                    )}
                    {notes.map((n) => (
                      <option key={n.id || n._id} value={n.id || n._id}>
                        {(n.title || "Untitled").slice(0, 50)}
                        {(n.title || "").length > 50 ? "…" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={loading || notes.length === 0}
                  onClick={handleExportMarkdown}
                >
                  <FileText className="size-4 mr-1" />
                  Download .md
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
