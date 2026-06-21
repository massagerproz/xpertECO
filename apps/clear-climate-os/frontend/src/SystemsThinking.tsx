import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { GitCommit, Check, X, Box, Loader2, Workflow } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SystemsThinking() {
  const notes = useQuery(api.queries.getNotes) || [];
  const variables = useQuery(api.queries.getSystemVariables, {}) || [];
  const links = useQuery(api.queries.getSystemLinks, {}) || [];

  const addSystemVariable = useMutation(api.mutations.addSystemVariable);
  const updateSystemVariableStatus = useMutation(api.mutations.updateSystemVariableStatus);
  const addSystemLink = useMutation(api.mutations.addSystemLink);
  const updateSystemLinkStatus = useMutation(api.mutations.updateSystemLinkStatus);

  const [isGenerating, setIsGenerating] = useState(false);

  const pendingVariables = variables.filter((v) => v.status === "pending");
  const approvedVariables = variables.filter((v) => v.status === "approved");

  const pendingLinks = links.filter((l) => l.status === "pending");
  const approvedLinks = links.filter((l) => l.status === "approved");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const notesContent = notes.map((n) => n.content).join("\n\n");
      const res = await fetch("http://localhost:8000/generate_systems_map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesContent }),
      });
      const data = await res.json();

      for (const v of data.variables || []) {
        await addSystemVariable({
          name: v.name,
          description: v.description,
          status: "pending",
        });
      }

      for (const l of data.links || []) {
        await addSystemLink({
          source: l.source,
          target: l.target,
          effect: l.effect,
          description: l.description,
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
            <Workflow className="w-5 h-5 text-fuchsia-500" />
            Systems Thinking
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Discover causal loops and system variables
          </p>
        </div>
        <motion.button
          whileHover={(!isGenerating && notes.length > 0) ? { scale: 1.02 } : {}}
          whileTap={(!isGenerating && notes.length > 0) ? { scale: 0.98 } : {}}
          onClick={handleGenerate}
          disabled={isGenerating || notes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 text-white text-sm font-medium rounded-lg hover:bg-fuchsia-700 disabled:opacity-50 transition-colors"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCommit className="w-4 h-4" />}
          Extract Systems Map
        </motion.button>
      </div>

      <div className="p-6">
        {(pendingVariables.length > 0 || pendingLinks.length > 0) && (
          <motion.div layout className="mb-8">
            <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Draft Relationships Review
            </h3>
            <motion.div layout className="space-y-4">
              <AnimatePresence>
                {pendingVariables.map((v) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={v._id}
                    className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex justify-between items-start"
                  >
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mb-2">
                        VARIABLE
                      </span>
                      <p className="font-medium text-sm text-slate-800">{v.name}</p>
                      <p className="text-sm text-slate-600">{v.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => updateSystemVariableStatus({ id: v._id, status: "approved" })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md">
                        <Check className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => updateSystemVariableStatus({ id: v._id, status: "rejected" })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md">
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}

                {pendingLinks.map((l) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={l._id}
                    className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex justify-between items-start"
                  >
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mb-2">
                        LINK: {l.effect.toUpperCase()}
                      </span>
                      <p className="text-sm font-medium text-slate-800">{l.source} → {l.target}</p>
                      <p className="text-sm text-slate-600">{l.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => updateSystemLinkStatus({ id: l._id, status: "approved" })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md">
                        <Check className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => updateSystemLinkStatus({ id: l._id, status: "rejected" })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md">
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
            Approved Systems Model
          </h3>
          {approvedVariables.length === 0 && approvedLinks.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 border border-slate-100 border-dashed rounded-lg">
              <Box className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No approved system variables yet.</p>
            </div>
          ) : (
            <motion.div layout className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Variables</h4>
                <motion.div layout className="grid gap-2 grid-cols-1 md:grid-cols-2">
                  <AnimatePresence>
                    {approvedVariables.map((v) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={v._id}
                        className="p-3 border border-slate-200 rounded-lg bg-white"
                      >
                        <p className="font-medium text-sm text-slate-800">{v.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{v.description}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              {approvedLinks.length > 0 && (
                <motion.div layout>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Causal Links</h4>
                  <motion.div layout className="grid gap-2">
                    <AnimatePresence>
                      {approvedLinks.map((l) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={l._id}
                          className="p-3 border border-slate-200 rounded-lg bg-white flex items-center gap-4"
                        >
                          <div className="flex items-center gap-2 min-w-[200px]">
                            <span className="font-medium text-sm text-slate-700">{l.source}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${l.effect === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {l.effect === 'positive' ? '+' : '-'}
                            </span>
                            <span className="font-medium text-sm text-slate-700">{l.target}</span>
                          </div>
                          <p className="text-xs text-slate-500">{l.description}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
