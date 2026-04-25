"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
}

interface TranscriptEntry {
  id: string;
  text: string;
  fileName: string | null;
  createdAt: string;
  user: {
    email: string;
    name?: string;
  };
}

export default function DashboardClient({ user }: { user?: User }) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<TranscriptEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    transcriptId: string;
    fileName: string;
  }>({
    isOpen: false,
    transcriptId: "",
    fileName: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    transcript: TranscriptEntry | null;
  }>({
    isOpen: false,
    transcript: null,
  });
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (< 1 MB = ~1 min audio)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10 MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("audio/")) {
        setError("Please select a valid audio file");
        return;
      }

      setError("");
      setAudioFile(file);
    }
  };

  const handleUpload = async () => {
    if (!audioFile) {
      setError("Please select an audio file");
      return;
    }

    setLoading(true);
    setError("");
    setTranscript("");

    try {
      const formData = new FormData();
      formData.append("file", audioFile);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Transcription failed");
      }

      const data = await response.json();
      setTranscript(data.transcript);
      setAudioFile(null);
      fetchHistory(); // Refresh history after successful upload

      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      setError(err.message || "An error occurred during transcription");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/transcripts");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.transcripts);
      }
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle keyboard events for modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (deleteModal.isOpen) {
          cancelDelete();
        }
        if (viewModal.isOpen) {
          closeTranscriptView();
        }
      }
    };

    if (deleteModal.isOpen || viewModal.isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [deleteModal.isOpen, viewModal.isOpen]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      
      const result = await signOut({
        fetchOptions: {
          onSuccess: () => {
            // Clear any local state
            setHistory([]);
            setTranscript("");
            setAudioFile(null);
            // Navigate to login
            router.push("/login");
          },
          onError: (error) => {
            console.error("Logout error:", error);
            // Force navigation even if there's an error
            router.push("/login");
          },
        },
      });
      
      // Fallback navigation if the callback doesn't work
      setTimeout(() => {
        router.push("/login");
      }, 1000);
      
    } catch (error) {
      console.error("Logout failed:", error);
      // Force navigation on error
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleDeleteTranscript = async (transcriptId: string, fileName: string) => {
    // Open the delete modal instead of using confirm()
    setDeleteModal({
      isOpen: true,
      transcriptId,
      fileName,
    });
  };

  const confirmDelete = async () => {
    const { transcriptId, fileName } = deleteModal;
    
    try {
      setDeletingId(transcriptId);
      setDeleteModal({ isOpen: false, transcriptId: "", fileName: "" });
      
      console.log("Deleting transcript:", transcriptId);
      
      const response = await fetch(`/api/transcripts/${transcriptId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to delete transcript";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Delete result:", result);

      // Remove from local state
      setHistory(prev => prev.filter(t => t.id !== transcriptId));
      
      // Show success message with a better notification
      setError("");
      setSuccessMessage("Transcript deleted successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
    } catch (error: any) {
      console.error("Delete error:", error);
      setError(error.message || "Failed to delete transcript");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, transcriptId: "", fileName: "" });
  };

  const openTranscriptView = (transcript: TranscriptEntry) => {
    setViewModal({
      isOpen: true,
      transcript,
    });
  };

  const closeTranscriptView = () => {
    setViewModal({
      isOpen: false,
      transcript: null,
    });
  };

  const handleCopyTranscript = async (text: string, transcriptId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(transcriptId);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      setError("Failed to copy transcript");
      // Clear error after 3 seconds
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">TraceLog</h1>
            <p className="text-sm text-slate-600">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.email || "admin@tracelog.com"}</span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              {loggingOut ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging out...
                </>
              ) : (
                "Logout"
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Upload Audio for Transcription
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Audio File
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-400 transition cursor-pointer">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={loading}
                className="w-full cursor-pointer"
              />
              <p className="text-xs text-slate-600 mt-2">
                Supported formats: MP3, WAV, OGG, M4A (Max 10 MB)
              </p>
            </div>

            {audioFile && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Selected: {audioFile.name}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Size: {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading || !audioFile}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Transcribing...
              </>
            ) : (
              "Upload & Transcribe"
            )}
          </button>

          {/* Transcript Display */}
          {transcript && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Latest Transcript
              </h3>
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {transcript}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(transcript);
                  alert("Transcript copied to clipboard!");
                }}
                className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg text-sm font-medium transition"
              >
                Copy Transcript
              </button>
            </div>
          )}
        </div>

        {/* Transcript History */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            All Transcripts (Admin View)
          </h2>

          {historyLoading ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-slate-500 text-sm">No transcripts yet. Upload an audio file to get started.</p>
          ) : (
            <div className="space-y-4">
              {history.map((t) => (
                <div key={t.id} className="transcript-card border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">
                        {t.fileName || "Untitled"}
                      </span>
                      <span className="text-xs text-blue-600 font-medium">
                        Uploaded by: {t.user.name || t.user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {new Date(t.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTranscript(t.id, t.fileName || "Untitled");
                        }}
                        disabled={deletingId === t.id}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition disabled:opacity-50 z-10"
                        title="Delete transcript"
                      >
                        {deletingId === t.id ? (
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div 
                    className="flex-1"
                    onClick={() => openTranscriptView(t)}
                  >
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap line-clamp-4 hover:text-slate-900 transition-colors mb-2">
                      {t.text}
                    </p>
                    <div className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Click to view full transcript
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyTranscript(t.text, t.id);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      {copiedId === t.id ? (
                        <>
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Transcript
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-medium text-gray-900">
                  "{deleteModal.fileName || 'this transcript'}"
                </span>
                ?
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId === deleteModal.transcriptId}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition flex items-center gap-2"
              >
                {deletingId === deleteModal.transcriptId ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transcript View Modal */}
      {viewModal.isOpen && viewModal.transcript && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">
                  {viewModal.transcript.fileName || "Untitled"}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                  <span>
                    Uploaded by: {viewModal.transcript.user.name || viewModal.transcript.user.email}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(viewModal.transcript.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={closeTranscriptView}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
                title="Close"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                  {viewModal.transcript.text}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
              <div className="text-sm text-slate-500">
                {viewModal.transcript.text.length} characters • {viewModal.transcript.text.split(' ').length} words
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopyTranscript(viewModal.transcript!.text, viewModal.transcript!.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                  {copiedId === viewModal.transcript.id ? (
                    <>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Text
                    </>
                  )}
                </button>
                <button
                  onClick={closeTranscriptView}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
