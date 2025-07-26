// localStorage utilities for guest notes
export const saveNotesToStorage = (notes) => {
  try {
    localStorage.setItem('guestNotes', JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes to localStorage:', error);
  }
};

export const getNotesFromStorage = () => {
  try {
    const notes = localStorage.getItem('guestNotes');
    return notes ? JSON.parse(notes) : [];
  } catch (error) {
    console.error('Error reading notes from localStorage:', error);
    return [];
  }
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Date formatting utility
export const formatDate = (date) => {
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Pomodoro timer utilities
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const POMODORO_MODES = {
  POMODORO: 'pomodoro',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
};

export const TIMER_DURATIONS = {
  [POMODORO_MODES.POMODORO]: 25 * 60, // 25 minutes
  [POMODORO_MODES.SHORT_BREAK]: 5 * 60, // 5 minutes
  [POMODORO_MODES.LONG_BREAK]: 15 * 60 // 15 minutes
};
