import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Wallet, Check, X, Box, Loader2 } from "lucide-react";

export function ResourceTracker() {
  const notes = useQuery(api.queries.getNotes) || [];
  const resources = useQuery(api.queries.getResources, {}) || [];

  const addResource = useMutation(api.mutations.addResource);
  const updateResourceStatus = useMutation(api.mutations.updateResourceStatus);

  const [isGenerating, setIsGenerating] = useState(false);

  const pendingResources = resources.filter((r) => r.status === "pending");
  const approvedResources = resources.filter((r) => r.status === "approved");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const notesContent = notes.map((n) => n.content).join("\n\n");
      const res = await fetch("http://localhost:8000/generate_resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesContent }),
      });
      const data = await res.json();

      for (const r of data.resources || []) {
        await addResource({
          name: r.name,
          category: r.category,
          statusLabel: r.status,
          description: r.description,
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
            <Wallet className="w-5 h-5 text-teal-500" />
            Resource Tracker
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Map financial, human, and material resources
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || notes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
          Extract Resources
        </button>
      </div>

      <div className="p-6">
        {pendingResources.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Requires Review ({pendingResources.length})
            </h3>
            <div className="space-y-3">
              {pendingResources.map((r) => (
                <div key={r._id} className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800">{r.name}</p>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                        {r.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{r.description}</p>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white border border-slate-200 text-slate-500">
                      State: {r.statusLabel}
                    </span>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => updateResourceStatus({ id: r._id, status: "approved" })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateResourceStatus({ id: r._id, status: "rejected" })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md">
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
            Approved Resources ({approvedResources.length})
          </h3>
          {approvedResources.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 border border-slate-100 border-dashed rounded-lg">
              <Box className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No approved resources yet.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {approvedResources.map((r) => (
                <div key={r._id} className="p-4 border border-slate-100 rounded-lg bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-slate-800">{r.name}</p>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      r.statusLabel === 'secured' ? 'bg-emerald-100 text-emerald-700' :
                      r.statusLabel === 'at_risk' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {r.statusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{r.description}</p>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {r.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
