
import { useQuery, useMutation } from "convex/react";
import { CheckCircle2, XCircle, LayoutList } from "lucide-react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";

export function EvidenceReview() {
  const pendingEvidence = useQuery(api.queries.getEvidence, { status: "pending" });
  const approvedEvidence = useQuery(api.queries.getEvidence, { status: "approved" });
  const updateStatus = useMutation(api.mutations.updateEvidenceStatus);

  const handleApprove = async (id: any) => {
    await updateStatus({ id, status: "approved" });
  };

  const handleReject = async (id: any) => {
    await updateStatus({ id, status: "rejected" });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center space-x-2">
        <LayoutList className="w-5 h-5 text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-800">2. Review & Approve Evidence</h2>
      </div>

      <div className="p-6 space-y-8">
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Pending Review</h3>
          {pendingEvidence === undefined ? (
            <div className="animate-pulse flex space-x-4">
              <div className="h-16 bg-slate-100 rounded w-full"></div>
            </div>
          ) : pendingEvidence.length === 0 ? (
            <div className="p-6 border border-dashed border-slate-200 rounded-lg text-center">
              <p className="text-slate-500 text-sm">No pending evidence. Extract notes above to begin.</p>
            </div>
          ) : (
            <motion.ul layout className="space-y-3">
              <AnimatePresence>
                {pendingEvidence.map((ev) => (
                  <motion.li
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={ev._id}
                    className="p-4 border border-amber-200 bg-amber-50/50 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-amber-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-block bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">{ev.type}</span>
                        <span className="text-xs text-slate-500">Source: {ev.sourceReference}</span>
                      </div>
                      <p className="text-slate-800 font-medium leading-snug">{ev.content}</p>
                    </div>
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(ev._id)}
                        className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-white border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReject(ev._id)}
                        className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-white border border-rose-200 text-rose-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </motion.button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Approved Tracker</h3>
            {approvedEvidence && approvedEvidence.length > 0 && (
               <div className="flex space-x-2 text-xs font-medium">
                  {Object.entries(
                    approvedEvidence.reduce((acc, ev) => {
                      acc[ev.type] = (acc[ev.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <span key={type} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full capitalize">
                      {count} {type.replace('_', ' ')}
                    </span>
                  ))}
               </div>
            )}
          </div>
          {approvedEvidence === undefined ? (
              <div className="animate-pulse flex space-x-4">
                <div className="h-10 bg-slate-100 rounded w-full"></div>
              </div>
          ) : approvedEvidence.length === 0 ? (
              <p className="text-slate-400 italic text-sm">No approved evidence yet.</p>
          ) : (
              <motion.ul layout className="space-y-2">
                <AnimatePresence>
                  {approvedEvidence.map(ev => (
                      <motion.li
                         layout
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         key={ev._id}
                         className="p-3 border border-slate-100 rounded-lg bg-slate-50 text-sm flex items-start space-x-3"
                      >
                         <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                         <div>
                           <span className="font-semibold text-slate-700 mr-2 capitalize">{ev.type.replace('_', ' ')}:</span>
                           <span className="text-slate-600">{ev.content}</span>
                         </div>
                      </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
          )}
        </div>
      </div>
    </div>
  );
}
