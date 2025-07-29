import { useState } from "react";
import { ArrowLeftIcon, FileText, Download } from "lucide-react";
import { Link, useNavigate } from "react-router";
import PDFUpload from "../components/PDFUpload";
import guestSyncService from "../lib/guestSync.service";
import toast from "react-hot-toast";

const PDFUploadPage = () => {
  const [extractedNotes, setExtractedNotes] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const handleNotesCreated = async (notes) => {
    setExtractedNotes(notes);
    setShowPreview(true);
  };

  const handleSaveAllNotes = async () => {
    try {
      for (const note of extractedNotes) {
        await guestSyncService.createNote({
          title: note.title,
          content: note.content
        });
      }
      
      toast.success(`Successfully saved ${extractedNotes.length} notes!`);
      navigate("/");
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save some notes');
    }
  };

  const handleSaveSelectedNotes = async (selectedNotes) => {
    try {
      for (const note of selectedNotes) {
        await guestSyncService.createNote({
          title: note.title,
          content: note.content
        });
      }
      
      toast.success(`Successfully saved ${selectedNotes.length} notes!`);
      navigate("/");
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save some notes');
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to={"/"} className="btn btn-ghost mb-6">
            <ArrowLeftIcon className="size-5" />
            Back to Notes
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PDF Upload Section */}
            <div>
              <PDFUpload onNotesCreated={handleNotesCreated} />
            </div>

            {/* Preview Section */}
            {showPreview && extractedNotes.length > 0 && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-xl mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Extracted Notes Preview
                  </h3>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {extractedNotes.map((note, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-lg mb-2">{note.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {note.content.length > 200 
                            ? `${note.content.substring(0, 200)}...` 
                            : note.content
                          }
                        </p>
                        {note.metadata && (
                          <div className="text-xs text-gray-500">
                            <p>Pages: {note.metadata.pages}</p>
                            {note.metadata.section && (
                              <p>Section: {note.metadata.section} of {note.metadata.totalSections}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="card-actions justify-end mt-6">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAllNotes}
                      className="btn btn-primary"
                    >
                      Save All Notes ({extractedNotes.length})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-xl mb-4">How to Extract Notes from PDF</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Upload PDF</h4>
                  <p className="text-sm text-gray-600">
                    Drag and drop your PDF file or click to browse. Supports files up to 10MB.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Automatic Processing</h4>
                  <p className="text-sm text-gray-600">
                    Our system extracts text and organizes it into manageable notes automatically.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Save Notes</h4>
                  <p className="text-sm text-gray-600">
                    Preview the extracted notes and save them to your collection for easy access.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Tips for Better Results</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use text-based PDFs for best extraction results</li>
                  <li>• Scanned PDFs may not extract text properly</li>
                  <li>• Large documents are automatically split into sections</li>
                  <li>• You can edit notes after saving them</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFUploadPage; 