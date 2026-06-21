import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Activity, Check, X, FileText, Loader2, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TheoryOfChange() {
  const notes = useQuery(api.queries.getNotes) || [];
  const tocItems = useQuery(api.queries.getTOCItems, {}) || [];
  const addTOCItem = useMutation(api.mutations.addTOCItem);
  const updateTOCItemStatus = useMutation(api.mutations.updateTOCItemStatus);

  const [isGenerating, setIsGenerating] = useState(false);

  const pendingItems = tocItems.filter((i) => i.status === "pending");
  const approvedItems = tocItems.filter((i) => i.status === "approved");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const notesContent = notes.map((n) => n.content).join("\n\n");
      const res = await fetch("http://localhost:8000/generate_toc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesContent }),
      });
      const data = await res.json();

      for (const item of data.items || []) {
        await addTOCItem({
          category: item.category,
          description: item.description,
          status: "pending",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/50 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-500" />
            Theory of Change Map
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Map inputs to impact based on project notes
          </p>
        </div>
        <motion.button
          whileHover={(!isGenerating && notes.length > 0) ? { scale: 1.02 } : {}}
          whileTap={(!isGenerating && notes.length > 0) ? { scale: 0.98 } : {}}
          onClick={handleGenerate}
          disabled={isGenerating || notes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          Generate Map
        </motion.button>
      </div>

      <div className="p-6">
        {pendingItems.length > 0 && (
          <motion.div layout className="mb-8">
            <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Requires Review ({pendingItems.length})
            </h3>
            <motion.div layout className="space-y-3">
              <AnimatePresence>
                {pendingItems.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item._id}
                    className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex justify-between items-start"
                  >
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mb-2">
                        {item.category.toUpperCase()}
                      </span>
                      <p className="text-sm text-slate-700">{item.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateTOCItemStatus({ id: item._id, status: "approved" })}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateTOCItemStatus({ id: item._id, status: "rejected" })}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}

        <motion.div layout>
          <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Approved Elements ({approvedItems.length})
          </h3>
          {approvedItems.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 border border-slate-100 border-dashed rounded-lg">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No approved ToC elements yet.</p>
            </div>
          ) : (
            <motion.div layout className="grid gap-3">
              <AnimatePresence>
                {approvedItems.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item._id}
                    className="p-4 border border-slate-100 rounded-lg bg-white flex items-start gap-4"
                  >
                    <div className="mt-0.5">
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        {item.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
