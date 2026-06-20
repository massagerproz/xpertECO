import { useState } from "react";

import { useQuery, useMutation } from "convex/react";
import { FileText, Download, ShieldAlert, FileOutput } from "lucide-react";
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
      const evidenceItems = approvedEvidence.map(ev => ({
        type: ev.type,
        content: ev.content,
        sourceReference: ev.sourceReference
      }));

      const response = await fetch("http://localhost:8000/generate_report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidence_items: evidenceItems }),
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">3. Report Draft & QA</h2>
        </div>
        <button
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          onClick={handleGenerateReport}
          disabled={isGenerating || !approvedEvidence || approvedEvidence.length === 0}
        >
          <FileOutput className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
          <span>{isGenerating ? "Generating Draft..." : "Generate Report"}</span>
        </button>
      </div>

      <div className="p-6 bg-slate-50/50">
          {reports === undefined ? (
              <div className="animate-pulse flex space-x-4">
                <div className="h-32 bg-slate-100 rounded w-full"></div>
              </div>
          ) : reports.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No reports generated yet.</p>
                <p className="text-slate-400 text-sm mt-1">Approve evidence above and click Generate.</p>
              </div>
          ) : (
              <div className="space-y-6">
                  {reports.map((report) => (
                      <div key={report._id} className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm transition-all hover:shadow-md">
                          <h4 className="font-bold text-xl text-slate-800 mb-3">{report.title}</h4>
                          <div className="prose prose-slate prose-sm max-w-none mb-6 text-slate-600">
                             <p>{report.body}</p>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                              <button
                                  onClick={() => handleRunQA(report._id, report.body)}
                                  disabled={isReviewing}
                                  className="flex items-center space-x-1.5 text-sm bg-purple-50 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100 border border-purple-200 font-medium transition-colors disabled:opacity-50"
                              >
                                  <ShieldAlert className={`w-4 h-4 ${isReviewing ? 'animate-pulse' : ''}`} />
                                  <span>{isReviewing ? "Running QA..." : "Run AI QA Review"}</span>
                              </button>
                              <button
                                  onClick={() => alert(`Exported: \n\n${report.title}\n\n${report.body}`)}
                                  className="flex items-center space-x-1.5 text-sm bg-white text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 border border-slate-300 font-medium transition-colors"
                              >
                                  <Download className="w-4 h-4" />
                                  <span>Export</span>
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
