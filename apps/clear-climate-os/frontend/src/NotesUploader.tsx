import { useState } from "react";

import { useMutation, useQuery } from "convex/react";
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
    <div className="p-4 border rounded shadow-sm bg-white mb-6">
      <h2 className="text-xl font-semibold mb-2">1. Input Meeting Notes</h2>
      <textarea
        className="w-full p-2 border rounded mb-2"
        rows={4}
        placeholder="Paste meeting notes, activity updates, etc."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        onClick={handleExtract}
        disabled={isExtracting || !notes.trim()}
      >
        {isExtracting ? "Extracting..." : "Extract Evidence"}
      </button>

      {savedNotes && savedNotes.length > 0 && (
         <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Notes</h3>
            <ul className="mt-2 text-sm text-gray-600">
              {savedNotes.slice(0, 3).map(n => (
                 <li key={n._id} className="truncate">{n.content}</li>
              ))}
            </ul>
         </div>
      )}
    </div>
  );
}
