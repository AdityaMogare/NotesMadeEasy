import { getNotesFromStorage, saveNotesToStorage, generateId } from './utils';
import guestSyncService from './guestSync.service';

const BACKUP_VERSION = 1;

/**
 * Expected shape: { notes: [...] } or just [...]
 * Each note: { title: string, content: string, id?, _id?, createdAt?, updatedAt?, ... }
 */
function parseBackupFile(data) {
  if (Array.isArray(data)) {
    return { notes: data };
  }
  if (data && typeof data === 'object' && Array.isArray(data.notes)) {
    return { notes: data.notes };
  }
  return null;
}

/**
 * Validate a single note has required fields.
 */
function isValidNote(note) {
  return (
    note &&
    typeof note === 'object' &&
    typeof note.title === 'string' &&
    typeof note.content === 'string' &&
    note.title.trim() !== ''
  );
}

/**
 * Validate imported JSON schema. Returns { valid: boolean, error?: string, notes?: [] }.
 */
export function validateImportedSchema(data) {
  try {
    const parsed = parseBackupFile(data);
    if (!parsed) {
      return { valid: false, error: 'Invalid format: expected an array of notes or { notes: [] }' };
    }

    const validNotes = [];
    for (let i = 0; i < parsed.notes.length; i++) {
      const n = parsed.notes[i];
      if (!isValidNote(n)) {
        return {
          valid: false,
          error: `Note at index ${i} is invalid: must have non-empty "title" and "content" (strings)`,
        };
      }
      validNotes.push({
        title: String(n.title).trim(),
        content: String(n.content).trim(),
      });
    }

    return { valid: true, notes: validNotes };
  } catch (e) {
    return { valid: false, error: e.message || 'Invalid JSON or schema' };
  }
}

/**
 * Check if two notes are duplicates (same title and content).
 */
function isDuplicate(a, b) {
  const titleA = (a.title || '').trim();
  const titleB = (b.title || '').trim();
  const contentA = (a.content || '').trim();
  const contentB = (b.content || '').trim();
  return titleA === titleB && contentA === contentB;
}

/**
 * Trigger browser download of a blob with the given filename.
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Get current date string for filenames (YYYY-MM-DD).
 */
function getDateString() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Export all notes as JSON and trigger download (notes_backup_YYYY-MM-DD.json).
 * Uses current data source (guest localStorage or API).
 */
export async function exportAllNotesAsJson() {
  const notes = await guestSyncService.getNotes();
  const payload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    notes: notes.map((n) => ({
      id: n.id ?? n._id,
      title: n.title,
      content: n.content,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      tags: n.tags,
      isGuestNote: n.isGuestNote,
      guestId: n.guestId,
    })),
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const filename = `notes_backup_${getDateString()}.json`;
  downloadBlob(blob, filename);
  return { count: notes.length, filename };
}

/**
 * Import notes from parsed JSON: validate schema, merge with existing, avoid duplicates.
 * For guest: merge into localStorage. For user: create each new note via API.
 * Returns { success: boolean, imported: number, skipped: number, error?: string }.
 */
export async function importNotesFromJson(parsedData) {
  const validation = validateImportedSchema(parsedData);
  if (!validation.valid) {
    return { success: false, imported: 0, skipped: 0, error: validation.error };
  }

  const existingNotes = await guestSyncService.getNotes();
  const toAdd = [];
  for (const imp of validation.notes) {
    const alreadyExists = existingNotes.some((existing) =>
      isDuplicate(existing, imp)
    );
    if (!alreadyExists) toAdd.push(imp);
  }

  const isAuthenticated = guestSyncService.isAuthenticated();

  if (isAuthenticated) {
    for (const note of toAdd) {
      await guestSyncService.createNote({ title: note.title, content: note.content });
    }
  } else {
    const guestId = guestSyncService.getGuestId();
    const now = new Date().toISOString();
    const newNotes = toAdd.map((n) => ({
      id: generateId(),
      title: n.title,
      content: n.content,
      createdAt: now,
      updatedAt: now,
      guestId,
    }));
    const merged = [...newNotes, ...existingNotes];
    saveNotesToStorage(merged);
  }

  return {
    success: true,
    imported: toAdd.length,
    skipped: validation.notes.length - toAdd.length,
  };
}

/**
 * Export a single note as Markdown and trigger download.
 * filename: slug from title + date, e.g. my-note_2025-03-06.md
 */
export function exportNoteAsMarkdown(note) {
  if (!note || typeof note.title !== 'string' || typeof note.content !== 'string') {
    throw new Error('Invalid note: must have title and content');
  }
  const title = note.title.trim() || 'Untitled';
  const content = note.content.trim();
  const md = `# ${title}\n\n${content}\n`;
  const slug = title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);
  const filename = `${slug || 'note'}_${getDateString()}.md`;
  const blob = new Blob([md], { type: 'text/markdown' });
  downloadBlob(blob, filename);
  return { filename };
}
