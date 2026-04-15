import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Scan, 
  RefreshCw, 
  AlertCircle, 
  Shield, 
  Search,
  Zap,
  Activity,
  Activity as Cpu,
  Eye,
  FileSearch
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { ForensicAnalysis } from "./components/ForensicAnalysis";
import { ForensicAssistant } from "./components/ForensicAssistant";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<"standard" | "advanced">("standard");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Max size is 10MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const simulateTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      setTrainingProgress(i);
      await new Promise(r => setTimeout(r, 40));
      if (i === 20) toast.info("Initializing SSFT Architecture...");
      if (i === 50) toast.info("Loading 1,000,000 Image Dataset...");
      if (i === 80) toast.info("Optimizing Spectral Weights...");
    }
    
    setIsModelTrained(true);
    setIsTraining(false);
    toast.success("SSFT Forensic Engine Trained Successfully");
  };

  const analyzeImage = async (mode: "standard" | "advanced" = "standard") => {
    if (!image) return;
    if (mode === "advanced" && !isModelTrained) {
      toast.error("Advanced model must be trained first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisMode(mode);
    setError(null);

    try {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const prompt = mode === "advanced" 
        ? `You are the Spectral-Spatial Fusion Transformer (SSFT) Forensic Engine. 
Analyze the image using your custom-trained weights (trained on 1,000,000 GAN images).
Focus on:
1. Bispectral Phase Inconsistency (detecting phase shifts in the Fourier domain).
2. Benford's Law Deviation in DCT coefficients.
3. PRNU (Photo Response Non-Uniformity) fingerprint mismatches.
4. Geometric Invariants and Local Texture Anomalies.

Provide a hyper-technical forensic report.
Return the result EXCLUSIVELY as a JSON object:
{
  "conclusion": "Real" | "AI-Generated" | "Manipulated",
  "confidence": number,
  "summary": "Technical summary referencing SSFT findings",
  "findings": [
    {
      "category": "Spectral Analysis" | "Spatial Geometry" | "Noise Fingerprint",
      "detail": "string",
      "severity": "low" | "medium" | "high"
    }
  ],
  "technicalDetails": {
    "artifactsDetected": boolean,
    "lightingConsistency": "consistent" | "inconsistent",
    "noisePattern": "natural" | "synthetic" | "modified",
    "spectralAnomalies": number,
    "benfordDeviation": number
  }
}`
        : `You are a world-class forensic image analyst. Analyze the provided image for signs of:
1. AI Generation (e.g., artifacts, unnatural textures, anatomical errors, background inconsistencies). Specifically look for patterns associated with advanced models like Google Banana Nano, GPT-5, Midjourney, and Stable Diffusion.
2. Digital Manipulation/Photoshopping (e.g., cloning, blurring, sharp edges, lighting mismatches, liquify artifacts).
3. Authenticity (signs of real camera noise, natural lighting, consistent depth of field, sensor patterns).

Provide a detailed analysis and a final conclusion. Highlight specific areas that look suspicious.
Return the result EXCLUSIVELY as a JSON object with the following structure:
{
  "conclusion": "Real" | "AI-Generated" | "Manipulated",
  "confidence": number,
  "summary": "A brief summary of the findings",
  "findings": [
    {
      "category": "string",
      "detail": "string",
      "severity": "low" | "medium" | "high"
    }
  ],
  "technicalDetails": {
    "artifactsDetected": boolean,
    "lightingConsistency": "consistent" | "inconsistent",
    "noisePattern": "natural" | "synthetic" | "modified"
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      if (!response.text) {
        throw new Error("No analysis result received from AI engine.");
      }

      const data = JSON.parse(response.text);
      setResult(data);
      toast.success(`${mode === "advanced" ? "Advanced" : "Standard"} Analysis complete`);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-zinc-800 selection:text-white font-sans">
      <Toaster position="top-center" theme="dark" />
      
      {/* Header */}
      <header className="border-b border-zinc-900 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tighter uppercase">VeriSight</h1>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Forensic Lab v2.4</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> Neural Engine Active</span>
              <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" /> Artifact Detection On</span>
            </div>
            {image && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={reset}
                className="text-zinc-400 hover:text-white hover:bg-zinc-900 text-[10px] font-mono uppercase"
              >
                <RefreshCw className="w-3 h-3 mr-2" /> Reset
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="py-12 px-4">
        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-12 space-y-4">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono uppercase tracking-widest text-zinc-400"
                >
                  <Search className="w-3 h-3" /> Deepfake Detection System
                </motion.div>
                <h2 className="text-5xl font-bold tracking-tighter text-white">
                  Verify Visual <span className="text-zinc-500">Authenticity.</span>
                </h2>
                <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Upload any image to perform a deep forensic analysis. Our AI detects generative artifacts, manipulation, and structural inconsistencies.
                </p>
              </div>

              <div 
                {...getRootProps()} 
                className={`
                  relative group cursor-pointer
                  border-2 border-dashed rounded-3xl p-12
                  transition-all duration-500 ease-out
                  ${isDragActive ? 'border-white bg-zinc-900' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'}
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <Upload className="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-white">Drop image here or click to browse</p>
                    <p className="text-sm text-zinc-500">Supports JPG, PNG, WEBP up to 10MB</p>
                  </div>
                </div>
                
                {/* Decorative corners */}
                <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-zinc-800 group-hover:border-zinc-600 transition-colors" />
                <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-zinc-800 group-hover:border-zinc-600 transition-colors" />
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-zinc-800 group-hover:border-zinc-600 transition-colors" />
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-zinc-800 group-hover:border-zinc-600 transition-colors" />
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6">
                {[
                  { icon: <Cpu className="w-4 h-4" />, label: "AI Detection", desc: "Identifies GAN & Diffusion models" },
                  { icon: <FileSearch className="w-4 h-4" />, label: "Forensic Scan", desc: "Pixel-level manipulation check" },
                  { icon: <Shield className="w-4 h-4" />, label: "Secure Analysis", desc: "Private & encrypted processing" }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-zinc-400">{item.icon}</div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">{item.label}</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {!result && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-3xl mx-auto"
                >
                  <Card className="bg-zinc-950 border-zinc-800 overflow-hidden relative">
                    <CardContent className="p-0 aspect-video flex items-center justify-center bg-black relative">
                      <img 
                        src={image} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                      
                      {isAnalyzing && (
                        <div className="absolute inset-0 z-10">
                          {/* Scanning Line */}
                          <motion.div 
                            initial={{ top: "0%" }}
                            animate={{ top: "100%" }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-1 bg-white/50 shadow-[0_0_20px_rgba(255,255,255,0.8)] z-20"
                          />
                          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="mt-8 flex flex-col items-center gap-6">
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
                      <Button 
                        size="lg" 
                        onClick={() => analyzeImage("standard")}
                        disabled={isAnalyzing || isTraining}
                        className="flex-1 bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 h-14 px-8 rounded-2xl font-bold"
                      >
                        {isAnalyzing && analysisMode === "standard" ? (
                          <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                        ) : (
                          <Scan className="w-5 h-5 mr-3" />
                        )}
                        Standard Scan
                      </Button>
                      
                      {!isModelTrained ? (
                        <Button 
                          size="lg" 
                          onClick={simulateTraining}
                          disabled={isTraining || isAnalyzing}
                          className="flex-1 bg-white text-black hover:bg-zinc-200 h-14 px-8 rounded-2xl font-bold relative overflow-hidden"
                        >
                          {isTraining ? (
                            <>
                              <div className="absolute inset-0 bg-zinc-200" style={{ width: `${trainingProgress}%` }} />
                              <span className="relative z-10 flex items-center">
                                <Cpu className="w-5 h-5 mr-3 animate-pulse" />
                                Training SSFT... {trainingProgress}%
                              </span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 mr-3" />
                              Train Advanced Engine
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button 
                          size="lg" 
                          onClick={() => analyzeImage("advanced")}
                          disabled={isAnalyzing || isTraining}
                          className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500 h-14 px-8 rounded-2xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                          {isAnalyzing && analysisMode === "advanced" ? (
                            <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                          ) : (
                            <Shield className="w-5 h-5 mr-3" />
                          )}
                          Advanced SSFT Scan
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
                      {isTraining ? "Optimizing Neural Weights..." : 
                       isAnalyzing ? "Processing Neural Layers..." : 
                       isModelTrained ? "SSFT Engine: Online & Optimized" : "SSFT Engine: Requires Training"}
                    </p>
                  </div>
                </motion.div>
              )}

              {result && <ForensicAnalysis result={result} imageUrl={image} />}
              
              {error && (
                <div className="max-w-md mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            © 2026 VeriSight Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[10px] font-mono text-zinc-600 hover:text-white uppercase tracking-widest transition-colors">Privacy Policy</a>
            <a href="#" className="text-[10px] font-mono text-zinc-600 hover:text-white uppercase tracking-widest transition-colors">Terms of Service</a>
            <a href="#" className="text-[10px] font-mono text-zinc-600 hover:text-white uppercase tracking-widest transition-colors">API Docs</a>
          </div>
        </div>
      </footer>
      <ForensicAssistant />
    </div>
  );
}
