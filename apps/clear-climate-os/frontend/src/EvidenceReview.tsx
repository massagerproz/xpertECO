
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

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
    <div className="p-4 border rounded shadow-sm bg-white mb-6">
      <h2 className="text-xl font-semibold mb-2">2. Review & Approve Evidence</h2>

      <div className="mb-4">
        <h3 className="font-medium text-lg">Pending Review</h3>
        {pendingEvidence === undefined ? (
          <p>Loading...</p>
        ) : pendingEvidence.length === 0 ? (
          <p className="text-gray-500 italic">No pending evidence.</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {pendingEvidence.map((ev) => (
              <li key={ev._id} className="p-3 border border-yellow-200 bg-yellow-50 rounded flex justify-between items-start">
                <div>
                  <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 rounded-full mb-1 uppercase tracking-wider">{ev.type}</span>
                  <p className="font-medium">{ev.content}</p>
                  <p className="text-sm text-gray-500">Source: {ev.sourceReference}</p>
                </div>
                <div className="space-x-2 ml-4 flex-shrink-0">
                  <button onClick={() => handleApprove(ev._id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Approve</button>
                  <button onClick={() => handleReject(ev._id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="font-medium text-lg">Approved Tracker</h3>
        {approvedEvidence === undefined ? (
            <p>Loading...</p>
        ) : approvedEvidence.length === 0 ? (
            <p className="text-gray-500 italic">No approved evidence yet.</p>
        ) : (
            <ul className="space-y-2 mt-2">
                {approvedEvidence.map(ev => (
                    <li key={ev._id} className="p-2 border rounded bg-gray-50 text-sm">
                       <span className="font-semibold text-gray-700 mr-2">[{ev.type}]</span>
                       {ev.content}
                    </li>
                ))}
            </ul>
        )}
      </div>
    </div>
  );
}
