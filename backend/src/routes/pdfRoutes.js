import express from 'express';
import multer from 'multer';
import { optionalAuthMiddleware } from '../middleware/auth.js';
import pdfParser from '../services/pdfParser.js';

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

router.post('/upload', optionalAuthMiddleware, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    if (!pdfParser.isSupportedFile(req.file.originalname)) {
      return res.status(400).json({ message: 'Only PDF files are supported' });
    }

    if (!pdfParser.isFileSizeValid(req.file.size)) {
      return res.status(400).json({ message: 'File exceeds maximum size of 10MB' });
    }

    const parsed = await pdfParser.extractStructuredNotes(req.file.buffer);
    const baseTitle =
      parsed.title && parsed.title !== 'PDF Document'
        ? parsed.title
        : req.file.originalname.replace(/\.pdf$/i, '') || 'PDF';

    let notes;
    if (parsed.sections.length === 0) {
      notes = [
        {
          title: `${baseTitle} (no text)`,
          content:
            'No extractable text was found in this PDF. It may be image-only (scanned), protected, or empty. Try a text-based PDF or use OCR first.',
          source: 'PDF Upload',
          metadata: {
            originalFilename: req.file.originalname,
            size: req.file.size,
            uploadDate: new Date().toISOString(),
            pages: parsed.pages,
            section: 1,
            totalSections: 1
          }
        }
      ];
    } else {
      notes = parsed.sections.map((content, index) => ({
        title:
          parsed.sections.length === 1
            ? baseTitle
            : `${baseTitle} — Part ${index + 1}`,
        content: content.trim(),
        source: 'PDF Upload',
        metadata: {
          originalFilename: req.file.originalname,
          size: req.file.size,
          uploadDate: new Date().toISOString(),
          pages: parsed.pages,
          section: index + 1,
          totalSections: parsed.sections.length
        }
      }));
    }

    res.json({
      message: 'PDF processed successfully',
      filename: req.file.originalname,
      size: req.file.size,
      notes,
      summary: {
        title: req.file.originalname,
        pages: parsed.pages,
        sections: parsed.sections.length,
        totalNotes: notes.length
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