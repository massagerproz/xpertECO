import { useState } from "react";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function ReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const approvedEvidence = useQuery(api.queries.getEvidence, { status: "approved" });
  const reports = useQuery(api.queries.getReports);
  const createReport = useMutation(api.mutations.createReport);
  const addQAReview = useMutation(api.mutations.addQAReview);

  // Helper component to fetch and display QA flags
  const QADisplay = ({ reportId }: { reportId: any }) => {
    const reviews = useQuery(api.queries.getQAReviews, { reportId });
    if (!reviews || reviews.length === 0) return null;

    return (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
            <h4 className="font-semibold text-red-800 mb-1">QA Flags Found:</h4>
            <ul className="list-disc pl-5 text-red-700">
                {reviews[0].flags.map((flag, i) => (
                    <li key={i}>
                        <span className="font-semibold capitalize">{flag.issueType.replace("_", " ")}: </span>
                        {flag.description}
                    </li>
                ))}
            </ul>
        </div>
    );
  };

  const handleGenerateReport = async () => {
    if (!approvedEvidence || approvedEvidence.length === 0) {
      alert("No approved evidence available to generate a report.");
      return;
    }

    setIsGenerating(true);
    try {
      const evidenceIds = approvedEvidence.map(ev => ev._id.toString());

      const response = await fetch("http://localhost:8000/generate_report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidence_ids: evidenceIds }),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const draft = await response.json();
      await createReport({ title: draft.title, body: draft.body });

    } catch (error) {
      console.error(error);
      alert("Error generating report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunQA = async (reportId: any, content: string) => {
    setIsReviewing(true);
    try {
      const response = await fetch("http://localhost:8000/qa_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_content: content }),
      });

      if (!response.ok) throw new Error("Failed to run QA review");

      const qaResult = await response.json();
      if (qaResult.flags && qaResult.flags.length > 0) {
          await addQAReview({
              reportId,
              flags: qaResult.flags.map((f: any) => ({
                  issueType: f.issue_type,
                  description: f.description
              }))
          });
      } else {
          alert("QA Passed! No issues flagged.");
      }

    } catch (error) {
      console.error(error);
      alert("Error running QA review");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow-sm bg-white mb-6">
      <h2 className="text-xl font-semibold mb-2">3. Report Draft & QA</h2>

      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-300 mb-4"
        onClick={handleGenerateReport}
        disabled={isGenerating || !approvedEvidence || approvedEvidence.length === 0}
      >
        {isGenerating ? "Generating..." : "Generate Report from Evidence"}
      </button>

      <div>
          <h3 className="font-medium text-lg mb-2">Generated Reports</h3>
          {reports === undefined ? (
              <p>Loading...</p>
          ) : reports.length === 0 ? (
              <p className="text-gray-500 italic">No reports generated yet.</p>
          ) : (
              <div className="space-y-4">
                  {reports.map((report) => (
                      <div key={report._id} className="p-4 border rounded bg-gray-50">
                          <h4 className="font-bold text-lg">{report.title}</h4>
                          <p className="mt-2 text-gray-800">{report.body}</p>

                          <div className="mt-4 flex space-x-3">
                              <button
                                  onClick={() => handleRunQA(report._id, report.body)}
                                  disabled={isReviewing}
                                  className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 border border-purple-300"
                              >
                                  Run QA Review
                              </button>
                              <button
                                  onClick={() => alert(`Exported: \n\n${report.title}\n\n${report.body}`)}
                                  className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 border border-gray-400"
                              >
                                  Export Report
                              </button>
                          </div>

                          <QADisplay reportId={report._id} />
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
}
