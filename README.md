# NotesMadeEasy - MVP

A simple, elegant note-taking app with Pomodoro timer for enhanced productivity. Built with React, Vite, and Tailwind CSS.

## ✨ Features

### 📝 Guest Notes
- **Offline-first**: All notes are saved locally in your browser
- **No account required**: Start taking notes immediately
- **Persistent storage**: Notes survive browser restarts
- **Create, edit, delete**: Full CRUD operations for your notes

### ⏱️ Pomodoro Timer
- **25/5/15 intervals**: Classic Pomodoro technique
- **Work sessions**: 25-minute focused work periods
- **Short breaks**: 5-minute breaks between sessions
- **Long breaks**: 15-minute breaks after 4 pomodoros
- **Visual progress**: See your timer progress
- **Notifications**: Browser notifications when sessions end
- **Session tracking**: Count completed pomodoros

### 🎨 Modern UI
- **Clean design**: Beautiful, responsive interface
- **Dark theme**: Easy on the eyes
- **Mobile-friendly**: Works great on all devices
- **Smooth animations**: Polished user experience

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NotesMadeEasy
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Usage

### Taking Notes
1. Click "New Note" to create a note
2. Add a title and content
3. Your notes are automatically saved locally
4. Edit or delete notes as needed

### Using the Pomodoro Timer
1. Click "Pomodoro" in the navigation
2. Choose your mode: Work, Short Break, or Long Break
3. Click "Start" to begin your session
4. Take breaks when the timer ends
5. Track your productivity with completed pomodoros

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Browser Notifications API
- **Storage**: localStorage for offline persistence
- **Styling**: DaisyUI components

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── lib/           # Utilities and helpers
│   └── App.jsx        # Main app component
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## 🎯 MVP Goals

This MVP version focuses on:
- ✅ Guest user experience (no backend required)
- ✅ Core note-taking functionality
- ✅ Pomodoro timer for productivity
- ✅ Offline persistence via localStorage
- ✅ Modern, responsive UI
- ✅ Browser notifications

## 🚧 Future Enhancements

- User accounts and cloud sync
- Note categories and tags
- Rich text editing
- Note sharing
- Advanced Pomodoro settings
- Statistics and analytics
- Mobile app

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Note**: This is an MVP version designed for guest users with local storage. For production use with user accounts and cloud sync, a backend server would be required.
