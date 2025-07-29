# NotesMadeEasy - v1 (Optional Login & User Sync)

A simple, elegant note-taking app with Pomodoro timer and optional user authentication. Built with React, Node.js, and MongoDB.

## ✨ Features

### 📝 **Hybrid Note System**
- **Guest Mode**: Start taking notes immediately without an account
- **User Accounts**: Create an account to sync notes across devices
- **Seamless Sync**: Convert guest notes to user notes with one click
- **Offline Support**: Works completely offline in guest mode
- **Cloud Backup**: Authenticated users get automatic cloud sync

### ⏱️ **Pomodoro Timer**
- **25/5/15 intervals**: Classic Pomodoro technique
- **Work sessions**: 25-minute focused work periods
- **Short breaks**: 5-minute breaks between sessions
- **Long breaks**: 15-minute breaks after 4 pomodoros
- **Visual progress**: See your timer progress
- **Notifications**: Browser notifications when sessions end
- **Session tracking**: Count completed pomodoros

### 🔐 **Authentication System**
- **Secure Registration**: Email and password-based accounts
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Session Management**: Persistent login across browser sessions
- **User Profiles**: Personal note collections per user

### 🎨 **Modern UI/UX**
- **Clean design**: Beautiful, responsive interface
- **Dark theme**: Easy on the eyes
- **Mobile-friendly**: Works great on all devices
- **Smooth animations**: Polished user experience
- **Toast notifications**: User-friendly feedback

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB database

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Usage

### Guest Mode
1. **Start immediately**: No account required
2. **Create notes**: Click "New Note" to start taking notes
3. **Local storage**: Notes are saved in your browser
4. **Sync later**: Create an account to sync your notes to the cloud

### User Accounts
1. **Create account**: Click "Sign Up" to register
2. **Login**: Use your email and password to sign in
3. **Cloud sync**: All notes are automatically synced
4. **Cross-device**: Access your notes from any device

### Guest Note Sync
1. **Create notes in guest mode**: Start taking notes immediately
2. **Register account**: Click "Sign Up" when ready
3. **Sync notes**: Click "Sync Notes" to transfer guest notes to your account
4. **Continue seamlessly**: All your notes are now in your account

### Pomodoro Timer
1. Click "Pomodoro" in the navigation
2. Choose your mode: Work, Short Break, or Long Break
3. Click "Start" to begin your session
4. Take breaks when the timer ends
5. Track your productivity with completed pomodoros

## 🛠️ Tech Stack

### Frontend
- **React 19**: Latest React features and performance
- **Vite**: Fast development and build process
- **Tailwind CSS**: Utility-first styling
- **DaisyUI**: Beautiful component library
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

### Authentication
- **JWT Tokens**: Secure authentication
- **Password Hashing**: bcryptjs for security
- **Session Management**: Persistent login state
- **Guest Mode**: Optional authentication

## 🔧 Development

### Available Scripts

#### Root Directory
```bash
npm run dev      # Start frontend development server
npm run build    # Build frontend for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

#### Backend
```bash
cd backend
npm run dev      # Start backend development server
npm start        # Start production server
```

#### Frontend
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Project Structure

```
NotesMadeEasy/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and Redis config
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Auth and rate limiting
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   └── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Services and utilities
│   │   └── App.jsx         # Main app component
│   └── package.json
└── README.md
```

## 🔐 Authentication Flow

### Guest Mode
1. User visits the app
2. Can immediately start taking notes
3. Notes are stored in localStorage
4. No account required

### User Registration
1. User clicks "Sign Up"
2. Fills out registration form
3. Account is created with hashed password
4. JWT token is generated and stored
5. User is redirected to home page

### User Login
1. User clicks "Login"
2. Enters email and password
3. Credentials are verified
4. JWT token is generated and stored
5. User is redirected to home page

### Guest Note Sync
1. User with guest notes registers/logs in
2. "Sync Notes" button appears in navigation
3. User clicks sync button
4. Guest notes are transferred to user account
5. Guest notes are cleared from localStorage
6. User sees all notes in their account

## 🎯 v1 Features

### ✅ Completed
- [x] Guest note-taking with localStorage
- [x] User registration and login
- [x] JWT-based authentication
- [x] Guest note sync to user accounts
- [x] Hybrid note system (guest + authenticated)
- [x] Pomodoro timer with notifications
- [x] Responsive design and modern UI
- [x] Offline support for guest mode
- [x] Secure password handling
- [x] Session persistence

### 🔄 Future Enhancements (v1.1+)
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Social login (Google, GitHub)
- [ ] User profile management
- [ ] Note sharing between users
- [ ] Advanced note features (tags, categories, search)
- [ ] Mobile app development
- [ ] Real-time collaboration features

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Note**: This is v1 with optional authentication. Users can start immediately in guest mode and optionally create accounts to sync their notes to the cloud.
