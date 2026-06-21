
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Leaf } from "lucide-react";
import { NotesUploader } from "./NotesUploader";
import { EvidenceReview } from "./EvidenceReview";
import { TheoryOfChange } from "./TheoryOfChange";
import { SystemsThinking } from "./SystemsThinking";
import { StakeholderMapping } from "./StakeholderMapping";
import { ResourceTracker } from "./ResourceTracker";
import { RiskAssessment } from "./RiskAssessment";
import { ReportGenerator } from "./ReportGenerator";

// Initialize Convex Client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Leaf className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">CLEAR Climate OS</h1>
            <p className="text-sm text-slate-500">AI-Assisted Evidence & Reporting</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <NotesUploader />
        <EvidenceReview />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TheoryOfChange />
          <SystemsThinking />
          <StakeholderMapping />
          <ResourceTracker />
          <RiskAssessment />
        </div>
        <ReportGenerator />
      </main>
    </div>
  );
}

function App() {
  return (
    <ConvexProvider client={convex}>
      <AppContent />
    </ConvexProvider>
  );
}

export default App;
