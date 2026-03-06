import fs from 'fs';

class PDFParserService {
  constructor() {
    this.supportedFormats = ['.pdf'];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.pdfParser = null;
  }

  // Initialize PDF parser lazily
  async getPDFParser() {
    if (!this.pdfParser) {
      try {
        const pdfParse = await import('pdf-parse');
        this.pdfParser = pdfParse.default;
      } catch (error) {
        console.error('Failed to load pdf-parse:', error);
        throw new Error('PDF parsing is not available');
      }
    }
    return this.pdfParser;
  }

  // Check if file is a supported PDF
  isSupportedFile(filename) {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return this.supportedFormats.includes(extension);
  }

  // Check if file size is within limits
  isFileSizeValid(fileSize) {
    return fileSize <= this.maxFileSize;
  }

  // Extract text from PDF file
  async extractTextFromPDF(filePath) {
    try {
      const pdfParse = await this.getPDFParser();
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      return {
        success: true,
        text: data.text,
        pages: data.numpages,
        info: data.info
      };
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF file');
    }
  }

  // Extract text from PDF buffer (for uploaded files)
  async extractTextFromBuffer(buffer) {
    try {
      const pdfParse = await this.getPDFParser();
      const data = await pdfParse(buffer);
      
      return {
        success: true,
        text: data.text,
        pages: data.numpages,
        info: data.info
      };
    } catch (error) {
      console.error('Error extracting text from PDF buffer:', error);
      throw new Error('Failed to extract text from PDF file');
    }
  }

  // Clean and format extracted text
  cleanText(text) {
    if (!text) return '';
    
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')   // Replace carriage returns
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .trim(); // Remove leading/trailing whitespace
  }

  // Split text into sections (for better note organization)
  splitTextIntoSections(text, maxSectionLength = 1000) {
    if (!text || text.length <= maxSectionLength) {
      return [text];
    }

    const sections = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let currentSection = '';

    for (const sentence of sentences) {
      const sentenceWithPunctuation = sentence.trim() + '.';
      
      if ((currentSection + sentenceWithPunctuation).length > maxSectionLength) {
        if (currentSection.trim()) {
          sections.push(currentSection.trim());
        }
        currentSection = sentenceWithPunctuation;
      } else {
        currentSection += (currentSection ? ' ' : '') + sentenceWithPunctuation;
      }
    }

    if (currentSection.trim()) {
      sections.push(currentSection.trim());
    }

    return sections;
  }

  // Generate note title from PDF info or text
  generateNoteTitle(info, text) {
    if (info && info.Title) {
      return info.Title;
    }
    
    if (text) {
      // Use first line or first sentence as title
      const firstLine = text.split('\n')[0].trim();
      if (firstLine.length > 0 && firstLine.length <= 100) {
        return firstLine;
      }
      
      // Use first sentence if first line is too long
      const firstSentence = text.split(/[.!?]/)[0].trim();
      if (firstSentence.length > 0 && firstSentence.length <= 100) {
        return firstSentence;
      }
    }
    
    return 'PDF Document';
  }

  // Extract structured notes from PDF
  async extractStructuredNotes(buffer) {
    try {
      const extraction = await this.extractTextFromBuffer(buffer);
      const cleanedText = this.cleanText(extraction.text);
      const sections = this.splitTextIntoSections(cleanedText);
      const title = this.generateNoteTitle(extraction.info, cleanedText);

      return {
        success: true,
        title,
        sections,
        pages: extraction.pages,
        info: extraction.info,
        fullText: cleanedText
      };
    } catch (error) {
      console.error('Error extracting structured notes:', error);
      throw new Error('Failed to extract structured notes from PDF');
    }
  }
}

export default new PDFParserService(); 