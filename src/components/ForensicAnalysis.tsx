import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldQuestion, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Zap,
  Activity,
  Maximize2,
  Fingerprint
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Finding {
  category: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

interface AnalysisResult {
  conclusion: "Real" | "AI-Generated" | "Manipulated";
  confidence: number;
  summary: string;
  findings: Finding[];
  technicalDetails: {
    artifactsDetected: boolean;
    lightingConsistency: string;
    noisePattern: string;
    spectralAnomalies?: number;
    benfordDeviation?: number;
  };
}

interface ForensicAnalysisProps {
  result: AnalysisResult;
  imageUrl: string;
}

export const ForensicAnalysis: React.FC<ForensicAnalysisProps> = ({ result, imageUrl }) => {
  const getConclusionIcon = () => {
    switch (result.conclusion) {
      case "Real":
        return <ShieldCheck className="w-12 h-12 text-emerald-500" />;
      case "AI-Generated":
        return <ShieldAlert className="w-12 h-12 text-rose-500" />;
      case "Manipulated":
        return <ShieldQuestion className="w-12 h-12 text-amber-500" />;
    }
  };

  const getConclusionColor = () => {
    switch (result.conclusion) {
      case "Real": return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
      case "AI-Generated": return "text-rose-500 border-rose-500/20 bg-rose-500/10";
      case "Manipulated": return "text-amber-500 border-amber-500/20 bg-amber-500/10";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-7xl mx-auto p-4"
    >
      {/* Left Column: Image Preview & Conclusion */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
          <CardHeader className="border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-zinc-400" />
                <CardTitle className="text-sm font-mono uppercase tracking-wider">Evidence Preview</CardTitle>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] uppercase">
                Source: User Upload
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 relative aspect-video bg-black flex items-center justify-center group">
            <img 
              src={imageUrl} 
              alt="Evidence" 
              className="max-w-full max-h-full object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent group-hover:border-zinc-500/10 transition-all duration-500" />
            
            {/* Corner Accents */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-zinc-700" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-zinc-700" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-zinc-700" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-zinc-700" />
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className={`p-4 rounded-2xl border ${getConclusionColor()}`}
              >
                {getConclusionIcon()}
              </motion.div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight text-white">
                    {result.conclusion}
                  </h3>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Confidence Score</span>
                    <span className={`text-xl font-mono font-bold ${result.confidence > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {result.confidence}%
                    </span>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {result.summary}
                </p>
                <div className="pt-2">
                  <Progress value={result.confidence} className="h-1 bg-zinc-800" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Detailed Findings */}
      <div className="lg:col-span-5 space-y-6">
        <Tabs defaultValue="findings" className="w-full">
          <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-1">
            <TabsTrigger value="findings" className="flex-1 font-mono text-xs uppercase">Findings</TabsTrigger>
            <TabsTrigger value="technical" className="flex-1 font-mono text-xs uppercase">Technical</TabsTrigger>
          </TabsList>
          
          <TabsContent value="findings" className="mt-4">
            <Card className="bg-zinc-950 border-zinc-800">
              <ScrollArea className="h-[500px]">
                <CardContent className="p-4 space-y-4">
                  {result.findings.map((finding, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{finding.category}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] uppercase font-mono ${
                            finding.severity === 'high' ? 'text-rose-400 border-rose-400/20 bg-rose-400/5' :
                            finding.severity === 'medium' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                            'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                          }`}
                        >
                          {finding.severity} risk
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-300 leading-snug">
                        {finding.detail}
                      </p>
                    </motion.div>
                  ))}
                </CardContent>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="mt-4">
            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <Zap className="w-4 h-4 text-zinc-500 mb-2" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Artifacts</span>
                    <span className="text-sm font-medium text-white">
                      {result.technicalDetails.artifactsDetected ? "Detected" : "None Found"}
                    </span>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <Activity className="w-4 h-4 text-zinc-500 mb-2" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Lighting</span>
                    <span className="text-sm font-medium text-white capitalize">
                      {result.technicalDetails.lightingConsistency}
                    </span>
                  </div>
                  {result.technicalDetails.spectralAnomalies !== undefined && (
                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Spectral Anomaly Index</span>
                        <span className="text-xs font-mono text-white">{(result.technicalDetails.spectralAnomalies * 100).toFixed(2)}%</span>
                      </div>
                      <Progress value={result.technicalDetails.spectralAnomalies * 100} className="h-1 bg-zinc-800" />
                    </div>
                  )}
                  {result.technicalDetails.benfordDeviation !== undefined && (
                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Benford's Law Deviation</span>
                        <span className="text-xs font-mono text-white">{(result.technicalDetails.benfordDeviation * 100).toFixed(2)}%</span>
                      </div>
                      <Progress value={result.technicalDetails.benfordDeviation * 100} className="h-1 bg-zinc-800" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-xs font-mono text-zinc-400 uppercase">Noise Pattern Analysis</span>
                    </div>
                    <span className="text-xs font-mono text-white capitalize">{result.technicalDetails.noisePattern}</span>
                  </div>
                  <div className="h-24 w-full bg-zinc-900 rounded border border-zinc-800 relative overflow-hidden">
                    {/* Simulated Waveform */}
                    <div className="absolute inset-0 flex items-center justify-around px-2">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: [10, Math.random() * 40 + 20, 10] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
                          className="w-1 bg-zinc-700 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Info className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase">Forensic Note</span>
                  </div>
                  <p className="text-xs text-zinc-400 italic">
                    Analysis performed using multi-stage neural network verification. Results are probabilistic and should be used as part of a broader investigative process.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};
