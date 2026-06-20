
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { NotesUploader } from "./NotesUploader";
import { EvidenceReview } from "./EvidenceReview";
import { ReportGenerator } from "./ReportGenerator";

// Initialize Convex Client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CLEAR Climate Copilot</h1>
          <p className="text-gray-600 mt-2">Convert scattered project information into structured reporting evidence.</p>
        </header>

        <main>
          <NotesUploader />
          <EvidenceReview />
          <ReportGenerator />
        </main>
      </div>
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
