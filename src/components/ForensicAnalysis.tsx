import React from "react";

interface Finding {
  category: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

interface AnalysisResult {
  conclusion: "Real" | "AI-Generated" | "Manipulated" | "Unknown";
  confidence: number;
  summary: string;
  findings: Finding[];
  technicalDetails: {
    artifactsDetected: boolean;
    lightingConsistency: string;
    noisePattern: string;
  };
}

interface Props {
  result: AnalysisResult;
  imageUrl: string;
}

export const ForensicAnalysis: React.FC<Props> = ({ result, imageUrl }) => {
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      
      {/* Image */}
      <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
        <img src={imageUrl} className="w-full object-contain max-h-[400px]" />
      </div>

      {/* Result */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white">
          Result: {result.conclusion}
        </h2>
        <p className="text-zinc-400 mt-2">{result.summary}</p>

        <div className="mt-4">
          <p className="text-sm text-zinc-500">Confidence</p>
          <div className="w-full bg-zinc-800 h-2 rounded mt-1">
            <div
              className="bg-green-500 h-2 rounded"
              style={{ width: `${result.confidence}%` }}
            />
          </div>
          <p className="text-xs mt-1">{result.confidence}%</p>
        </div>
      </div>

      {/* Findings */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Findings</h3>

        <div className="space-y-3">
          {result.findings.map((f, i) => (
            <div
              key={i}
              className="border border-zinc-800 p-3 rounded-lg"
            >
              <p className="text-xs text-zinc-500">{f.category}</p>
              <p className="text-sm text-white">{f.detail}</p>
              <span className="text-xs text-red-400">{f.severity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Technical Details</h3>

        <div className="space-y-2 text-sm text-zinc-300">
          <p>Artifacts: {result.technicalDetails.artifactsDetected ? "Yes" : "No"}</p>
          <p>Lighting: {result.technicalDetails.lightingConsistency}</p>
          <p>Noise: {result.technicalDetails.noisePattern}</p>
        </div>
      </div>

    </div>
  );
};