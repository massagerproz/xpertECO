import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ShieldAlert, Check, X, Shield, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function RiskAssessment() {
  const notes = useQuery(api.queries.getNotes) || [];
  const risks = useQuery(api.queries.getRisks, {}) || [];

  const addRisk = useMutation(api.mutations.addRisk);
  const updateRiskStatus = useMutation(api.mutations.updateRiskStatus);

  const [isGenerating, setIsGenerating] = useState(false);

  const pendingRisks = risks.filter((r) => r.status === "pending");
  const approvedRisks = risks.filter((r) => r.status === "approved");

  const springConfig = { type: "spring" as const, stiffness: 400, damping: 30 };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const notesContent = notes.map((n) => n.content).join("\n\n");
      const res = await fetch("http://localhost:8000/generate_risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesContent }),
      });
      const data = await res.json();

      for (const r of data.risks || []) {
        await addRisk({
          name: r.name,
          impact: r.impact,
          likelihood: r.likelihood,
          mitigation: r.mitigation,
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
    <section className="glass-panel rounded-2xl overflow-hidden">
      <div className="glass-header p-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            Risk Assessment
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Identify project risks and mitigation strategies
          </p>
        </div>
        <motion.button
          whileHover={(!isGenerating && notes.length > 0) ? { scale: 1.02 } : {}}
          whileTap={(!isGenerating && notes.length > 0) ? { scale: 0.98 } : {}}
          onClick={handleGenerate}
          disabled={isGenerating || notes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
          Extract Risks
        </motion.button>
      </div>

      <div className="p-6">
        {pendingRisks.length > 0 && (
          <motion.div layout className="mb-8">
            <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Requires Review ({pendingRisks.length})
            </h3>
            <motion.div layout className="space-y-3">
              <AnimatePresence>
                {pendingRisks.map((r, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    transition={{ ...springConfig, delay: i * 0.05 }}
                    key={r._id}
                    className="p-4 bg-white/60 backdrop-blur border border-white shadow-sm rounded-xl flex justify-between items-start"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 mb-1">{r.name}</p>
                      <div className="flex gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.impact === 'high' ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'}`}>
                          Impact: {r.impact}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.likelihood === 'high' ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'}`}>
                          Likelihood: {r.likelihood}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600"><strong>Mitigation:</strong> {r.mitigation}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => updateRiskStatus({ id: r._id, status: "approved" })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md">
                        <Check className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => updateRiskStatus({ id: r._id, status: "rejected" })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md">
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
            Approved Risks ({approvedRisks.length})
          </h3>
          {approvedRisks.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 border border-slate-100 border-dashed rounded-lg">
              <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No approved risks yet.</p>
            </div>
          ) : (
            <motion.div layout className="grid gap-3">
              <AnimatePresence>
                {approvedRisks.map((r, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springConfig, delay: i * 0.05 }}
                    key={r._id}
                    className="p-4 bg-white/80 border border-white shadow-sm rounded-xl"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-slate-800">{r.name}</p>
                      <div className="flex gap-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${r.impact === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                          Imp: {r.impact}
                        </span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${r.likelihood === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                          Lik: {r.likelihood}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500"><strong>Mitigation:</strong> {r.mitigation}</p>
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
