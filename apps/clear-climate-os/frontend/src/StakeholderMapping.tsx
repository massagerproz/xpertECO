import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Users, Check, X, UserCircle, Loader2 } from "lucide-react";

export function StakeholderMapping() {
  const notes = useQuery(api.queries.getNotes) || [];
  const stakeholders = useQuery(api.queries.getStakeholders, {}) || [];

  const addStakeholder = useMutation(api.mutations.addStakeholder);
  const updateStakeholderStatus = useMutation(api.mutations.updateStakeholderStatus);

  const [isGenerating, setIsGenerating] = useState(false);

  const pendingStakeholders = stakeholders.filter((s) => s.status === "pending");
  const approvedStakeholders = stakeholders.filter((s) => s.status === "approved");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const notesContent = notes.map((n) => n.content).join("\n\n");
      const res = await fetch("http://localhost:8000/generate_stakeholders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesContent }),
      });
      const data = await res.json();

      for (const s of data.stakeholders || []) {
        await addStakeholder({
          name: s.name,
          role: s.role,
          influence: s.influence,
          interest: s.interest,
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
            <Users className="w-5 h-5 text-blue-500" />
            Stakeholder Mapping
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Identify project stakeholders and their influence
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || notes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
          Extract Stakeholders
        </button>
      </div>

      <div className="p-6">
        {pendingStakeholders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Requires Review ({pendingStakeholders.length})
            </h3>
            <div className="space-y-3">
              {pendingStakeholders.map((s) => (
                <div key={s._id} className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-800">{s.name}</p>
                    <p className="text-sm text-slate-600">{s.role}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-white text-slate-600 border border-slate-200">
                        Influence: {s.influence}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-white text-slate-600 border border-slate-200">
                        Interest: {s.interest}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => updateStakeholderStatus({ id: s._id, status: "approved" })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateStakeholderStatus({ id: s._id, status: "rejected" })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Approved Stakeholders ({approvedStakeholders.length})
          </h3>
          {approvedStakeholders.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 border border-slate-100 border-dashed rounded-lg">
              <UserCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No approved stakeholders yet.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {approvedStakeholders.map((s) => (
                <div key={s._id} className="p-4 border border-slate-100 rounded-lg bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-800">{s.name}</p>
                      <p className="text-sm text-slate-500">{s.role}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${s.influence === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                        Inf: {s.influence}
                      </span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${s.interest === 'high' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        Int: {s.interest}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
