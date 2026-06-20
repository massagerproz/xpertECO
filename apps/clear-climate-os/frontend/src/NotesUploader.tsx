import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Sparkles, MessageSquarePlus, Clock } from "lucide-react";
import { api } from "../convex/_generated/api";

export function NotesUploader() {
  const [notes, setNotes] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const createNote = useMutation(api.mutations.createNote);
  const addEvidence = useMutation(api.mutations.addEvidence);

  const savedNotes = useQuery(api.queries.getNotes);

  const handleExtract = async () => {
    if (!notes.trim()) return;
    setIsExtracting(true);

    try {
      // Save the raw note first
      const noteId = await createNote({ content: notes });

      // Call the FastAPI backend to extract evidence
      // Note: Assuming FastAPI is running on localhost:8000
      const response = await fetch("http://localhost:8000/extract_evidence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to extract evidence");
      }

      const extractedData = await response.json();

      // Save extracted evidence as 'pending'
      for (const item of extractedData) {
        await addEvidence({
          noteId,
          type: item.type,
          content: item.content,
          sourceReference: item.source_reference,
          status: "pending",
        });
      }

      setNotes("");
    } catch (error) {
      console.error(error);
      alert("Error extracting evidence");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center space-x-2">
        <MessageSquarePlus className="w-5 h-5 text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-800">1. Input Meeting Notes</h2>
      </div>

      <div className="p-6">
        <textarea
          className="w-full p-4 border border-slate-200 rounded-lg mb-4 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none outline-none text-slate-700"
          rows={5}
          placeholder="Paste meeting notes, activity updates, emails, or transcripts here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">
            {notes.length} characters
          </p>
          <button
            className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={handleExtract}
            disabled={isExtracting || !notes.trim()}
          >
            <Sparkles className={`w-4 h-4 ${isExtracting ? 'animate-pulse' : ''}`} />
            <span>{isExtracting ? "Extracting..." : "Extract Evidence"}</span>
          </button>
        </div>

        {savedNotes && savedNotes.length > 0 && (
           <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-medium text-slate-600">Recent Inputs</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedNotes.slice(0, 3).map(n => (
                   <div key={n._id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600 line-clamp-2" title={n.content}>
                     {n.content}
                   </div>
                ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
