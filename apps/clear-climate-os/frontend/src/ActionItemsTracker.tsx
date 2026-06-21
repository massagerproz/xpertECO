import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ClipboardList, Check, X, CheckSquare, Loader2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ActionItemsTracker() {
  const notes = useQuery(api.queries.getNotes) || [];
  const actionItems = useQuery(api.queries.getActionItems, {}) || [];

  const addActionItem = useMutation(api.mutations.addActionItem);
  const updateActionItemStatus = useMutation(api.mutations.updateActionItemStatus);

  const [isGenerating, setIsGenerating] = useState(false);

  const pendingItems = actionItems.filter((a) => a.status === "pending");
  const approvedItems = actionItems.filter((a) => a.status === "approved");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const notesContent = notes.map((n) => n.content).join("\n\n");
      const res = await fetch("http://localhost:8000/generate_action_items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesContent }),
      });
      const data = await res.json();

      for (const a of data.actions || []) {
        await addActionItem({
          task: a.task,
          owner: a.owner,
          deadline: a.deadline,
          priority: a.priority,
          status: "pending",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Spring transition for smooth list item appearance
  const springConfig = { type: "spring" as const, stiffness: 400, damping: 30 };

  return (
    <section className="glass-panel rounded-2xl overflow-hidden">
      <div className="glass-header p-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-500" />
            Action Items
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Extract tasks, assignees, and deadlines
          </p>
        </div>
        <motion.button
          whileHover={(!isGenerating && notes.length > 0) ? { scale: 1.02 } : {}}
          whileTap={(!isGenerating && notes.length > 0) ? { scale: 0.98 } : {}}
          onClick={handleGenerate}
          disabled={isGenerating || notes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600/90 hover:bg-orange-600 text-white text-sm font-medium rounded-xl shadow-sm disabled:opacity-50 transition-colors"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
          Extract Tasks
        </motion.button>
      </div>

      <div className="p-6">
        {pendingItems.length > 0 && (
          <motion.div layout className="mb-8">
            <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
              Requires Review ({pendingItems.length})
            </h3>
            <motion.div layout className="space-y-3">
              <AnimatePresence>
                {pendingItems.map((a, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    transition={{ ...springConfig, delay: i * 0.05 }}
                    key={a._id}
                    className="p-4 bg-white/60 backdrop-blur border border-white rounded-xl shadow-sm flex justify-between items-start"
                  >
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          a.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                          a.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {a.priority} Priority
                        </span>
                        <span className="text-xs font-medium text-slate-500 bg-white/50 px-2 py-0.5 rounded-md border border-slate-100">
                          Due: {a.deadline}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 mb-2">{a.task}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50/50 inline-flex px-2 py-1 rounded-md border border-slate-100">
                        <User className="w-3 h-3" />
                        <span>{a.owner}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateActionItemStatus({ id: a._id, status: "approved" })}
                        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg shadow-sm border border-emerald-100"
                      >
                        <Check className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateActionItemStatus({ id: a._id, status: "rejected" })}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg shadow-sm border border-rose-100"
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
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            Approved Tasks ({approvedItems.length})
          </h3>
          {approvedItems.length === 0 ? (
            <div className="text-center py-8 bg-white/40 border border-white/60 border-dashed rounded-xl">
              <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No approved action items yet.</p>
            </div>
          ) : (
            <motion.div layout className="grid gap-3">
              <AnimatePresence>
                {approvedItems.map((a, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: i * 0.05 }}
                    key={a._id}
                    className="p-4 bg-white/80 border border-white shadow-sm rounded-xl"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-slate-800 line-clamp-2 pr-4">{a.task}</p>
                      <span className={`shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shadow-sm border ${
                        a.priority === 'high' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        a.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {a.priority}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100/60">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <User className="w-3.5 h-3.5" />
                        {a.owner}
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {a.deadline}
                      </span>
                    </div>
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
