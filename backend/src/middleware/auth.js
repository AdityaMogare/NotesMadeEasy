import User from '../models/User.js';

// Simple session storage (in production, use Redis or database)
// This needs to be a singleton that's shared across modules
let sessions = new Map();

// Function to get sessions (singleton pattern)
export const getSessions = () => {
  if (!sessions) {
    sessions = new Map();
  }
  return sessions;
};

export const authMiddleware = async (req, res, next) => {
  try {
    // Get session ID from header
    const sessionId = req.header('Authorization')?.replace('Bearer ', '');
    const sessionsMap = getSessions();
    
    if (!sessionId || !sessionsMap.has(sessionId)) {
      return res.status(401).json({ message: 'No session, authorization denied' });
    }

    // Get session data
    const session = sessionsMap.get(sessionId);
    
    // Check if user still exists
    const user = await User.findById(session.userId).select('-password');
    if (!user) {
      sessionsMap.delete(sessionId);
      return res.status(401).json({ message: 'Session is not valid' });
    }

    // Add user to request object
    req.user = { userId: session.userId };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Optional auth middleware (doesn't fail if no session)
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const sessionId = req.header('Authorization')?.replace('Bearer ', '');
    const sessionsMap = getSessions();
    
    if (!sessionId || !sessionsMap.has(sessionId)) {
      return next(); // Continue without authentication
    }

    const session = sessionsMap.get(sessionId);
    const user = await User.findById(session.userId).select('-password');
    if (user) {
      req.user = { userId: session.userId };
    }
    
    next();
  } catch (error) {
    // Continue without authentication if session is invalid
    next();
  }
};

// Export sessions for use in auth routes
export { getSessions as sessions }; 