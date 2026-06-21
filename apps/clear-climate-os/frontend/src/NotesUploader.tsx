import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Sparkles, MessageSquarePlus, Clock } from "lucide-react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";

export function NotesUploader() {
  const [notes, setNotes] = useState("");
  const [sourceType, setSourceType] = useState("meeting_note");
  const [isExtracting, setIsExtracting] = useState(false);
  const createNote = useMutation(api.mutations.createNote);
  const addEvidence = useMutation(api.mutations.addEvidence);

  const savedNotes = useQuery(api.queries.getNotes);

  const handleExtract = async () => {
    if (!notes.trim()) return;
    setIsExtracting(true);

    try {
      // Save the raw note first
      const noteId = await createNote({ content: notes, sourceType });

      // Call the FastAPI backend to extract evidence
      const response = await fetch("http://localhost:8000/extract_evidence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes, source_type: sourceType }),
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

  const springConfig = { type: "spring" as const, stiffness: 400, damping: 30 };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="glass-header px-6 py-5 flex items-center space-x-2">
        <MessageSquarePlus className="w-5 h-5 text-slate-500" />
        <h2 className="text-lg font-semibold text-slate-800">1. Input Meeting Notes</h2>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Source Type</label>
          <select
            className="w-full sm:w-auto p-2.5 border border-white/60 shadow-sm rounded-xl bg-white/50 backdrop-blur focus:bg-white/80 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 transition-all"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
          >
            <option value="meeting_note">Meeting Note</option>
            <option value="activity_update">Activity Update</option>
            <option value="stakeholder_input">Stakeholder Input</option>
            <option value="field_report">Field Report</option>
          </select>
        </div>
        <textarea
          className="w-full p-4 border border-white/60 shadow-sm rounded-xl mb-4 bg-white/50 backdrop-blur focus:bg-white/80 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none outline-none text-slate-700 placeholder:text-slate-400"
          rows={5}
          placeholder="Paste meeting notes, activity updates, emails, or transcripts here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">
            {notes.length} characters
          </p>
          <motion.button
            whileHover={(!isExtracting && notes.trim()) ? { scale: 1.02 } : {}}
            whileTap={(!isExtracting && notes.trim()) ? { scale: 0.98 } : {}}
            className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={handleExtract}
            disabled={isExtracting || !notes.trim()}
          >
            <Sparkles className={`w-4 h-4 ${isExtracting ? 'animate-pulse' : ''}`} />
            <span>{isExtracting ? "Extracting..." : "Extract Evidence"}</span>
          </motion.button>
        </div>

        {savedNotes && savedNotes.length > 0 && (
           <motion.div layout className="mt-8 pt-6 border-t border-white/40">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-medium text-slate-600">Recent Inputs</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedNotes.slice(0, 3).map((n, i) => (
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ ...springConfig, delay: i * 0.1 }}
                     key={n._id}
                     className="p-3 bg-white/40 border border-white/60 shadow-sm rounded-xl text-sm text-slate-600 flex flex-col hover:bg-white/60 transition-colors"
                     title={n.content}
                   >
                     <span className="text-xs font-semibold text-emerald-700 mb-1 capitalize">{(n.sourceType || 'Note').replace('_', ' ')}</span>
                     <span className="line-clamp-2">{n.content}</span>
                   </motion.div>
                ))}
              </div>
           </motion.div>
        )}
      </div>
    </div>
  );
}
