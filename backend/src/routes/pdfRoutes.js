import express from 'express';
import multer from 'multer';
import { optionalAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads (using memory storage)
const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage instead of disk
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is PDF
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Upload PDF (placeholder for now)
router.post('/upload', optionalAuthMiddleware, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    // For now, just return a success message
    // PDF parsing will be implemented later
    res.json({
      message: 'PDF uploaded successfully (parsing coming soon)',
      filename: req.file.originalname,
      size: req.file.size,
      notes: [
        {
          title: 'PDF Document - ' + req.file.originalname,
          content: 'PDF parsing functionality will be available soon. Your file has been uploaded successfully.',
          source: 'PDF Upload',
          metadata: {
            originalFilename: req.file.originalname,
            size: req.file.size,
            uploadDate: new Date().toISOString()
          }
        }
      ],
      summary: {
        title: req.file.originalname,
        pages: 'Unknown',
        sections: 1,
        totalNotes: 1
      }
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to process PDF file' 
    });
  }
});

// Get supported file formats
router.get('/formats', (req, res) => {
  res.json({
    supportedFormats: ['.pdf'],
    maxFileSize: 10 * 1024 * 1024
  });
});

export default router; 