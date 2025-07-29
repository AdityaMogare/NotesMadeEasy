import { useState, useRef } from 'react';
import { Upload, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const PDFUpload = ({ onNotesCreated }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf')) {
      toast.error('Please select a PDF file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await api.post('/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      const { notes, summary } = response.data;

      // Create notes from extracted content
      if (notes && notes.length > 0) {
        // If onNotesCreated callback is provided, use it
        if (onNotesCreated) {
          onNotesCreated(notes);
        } else {
          // Otherwise, show success message
          toast.success(`Successfully extracted ${notes.length} notes from PDF`);
        }
      }

      toast.success(`PDF processed successfully! Extracted ${summary.totalNotes} notes from ${summary.pages} pages.`);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload PDF');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title text-xl mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Extract Notes from PDF
        </h3>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/10'
              : 'border-gray-300 hover:border-primary/50'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {isUploading ? (
            <div className="space-y-4">
              <Loader className="w-12 h-12 mx-auto animate-spin text-primary" />
              <div>
                <p className="text-lg font-medium">Processing PDF...</p>
                <p className="text-sm text-gray-600">Extracting text and creating notes</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium">
                  Drop your PDF here or click to browse
                </p>
                <p className="text-sm text-gray-600">
                  Extract notes from PDF documents (max 10MB)
                </p>
              </div>
              <button
                onClick={handleClick}
                className="btn btn-primary"
                disabled={isUploading}
              >
                Choose PDF File
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Supports PDF files up to 10MB</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Automatically extracts text and creates notes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Organizes content into manageable sections</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFUpload; 