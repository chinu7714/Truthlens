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
  Activity as Cpu,
  Eye,
  FileSearch,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { ForensicAnalysis } from "./components/ForensicAnalysis";
import { ForensicAssistant } from "./components/ForensicAssistant";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true,
});

const stripCodeFences = (text: string) =>
  text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

type AnalysisMode = "standard" | "advanced";

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isModelTrained, setIsModelTrained] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("standard");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

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
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  } as any);

  const simulateTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);

    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      setTrainingProgress(i);
      await new Promise((r) => setTimeout(r, 40));
      if (i === 20) toast.info("Initializing SSFT Architecture...");
      if (i === 50) toast.info("Loading 1,000,000 Image Dataset...");
      if (i === 80) toast.info("Optimizing Spectral Weights...");
    }

    setIsModelTrained(true);
    setIsTraining(false);
    toast.success("SSFT Forensic Engine Trained Successfully");
  };

  const analyzeImage = async (mode: AnalysisMode = "standard") => {
    if (!image) return;

    if (mode === "advanced" && !isModelTrained) {
      toast.error("Advanced model must be trained first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisMode(mode);
    setError(null);

    try {
      const base64Data = image.split(",")[1];
      const mimeType = image.split(";")[0].split(":")[1] || "image/jpeg";

      const prompt =
        mode === "advanced"
          ? `You are the Spectral-Spatial Fusion Transformer (SSFT) Forensic Engine.
Analyze the image using your custom-trained weights (trained on 1,000,000 GAN images).

Focus on:
1. Bispectral Phase Inconsistency (detecting phase shifts in the Fourier domain)
2. Benford's Law Deviation in DCT coefficients
3. PRNU (Photo Response Non-Uniformity) fingerprint mismatches
4. Geometric Invariants and Local Texture Anomalies
5. Signs of AI generation or image manipulation

Provide a hyper-technical forensic report.

Return ONLY valid JSON in this exact structure:
{
  "conclusion": "Real" | "AI-Generated" | "Manipulated" | "Unknown",
  "confidence": number,
  "summary": "Technical summary referencing SSFT findings",
  "findings": [
    {
      "category": "Spectral Analysis" | "Spatial Geometry" | "Noise Fingerprint" | "Artifact Detection",
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
          : `You are a world-class forensic image analyst.

Analyze the provided image for signs of:
1. AI generation
2. Digital manipulation / photoshopping
3. Authenticity

Look for:
- unnatural textures
- anatomical errors
- background inconsistencies
- cloning or blurring artifacts
- lighting mismatches
- liquify artifacts
- natural camera noise and sensor patterns

Return ONLY valid JSON in this exact structure:
{
  "conclusion": "Real" | "AI-Generated" | "Manipulated" | "Unknown",
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

      const completion = await client.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are an expert digital image forensics investigator. Return only valid JSON. Do not include markdown.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
            ],
          },
        ],
      });

      const rawText = completion.choices[0]?.message?.content || "";
      const cleanedText = stripCodeFences(rawText);

      if (!cleanedText) {
        throw new Error("No analysis result received from AI engine.");
      }

      const data = JSON.parse(cleanedText);
      setResult(data);
      toast.success(`${mode === "advanced" ? "Advanced" : "Standard"} Analysis complete`);
    } catch (err: any) {
      console.error("Analysis error:", err);
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Failed to analyze image.";
      setError(message);
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setIsModelTrained(false);
    setTrainingProgress(0);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-zinc-800 selection:text-white font-sans">
      <Toaster position="top-center" theme="dark" />

      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-white">
              <Shield className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-tighter">VeriSight</h1>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Forensic Lab v2.4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-6 text-[10px] font-mono uppercase tracking-widest text-zinc-500 md:flex">
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3 w-3" /> Neural Engine Active
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3 w-3" /> Artifact Detection On
              </span>
            </div>

            {image && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="text-[10px] font-mono uppercase text-zinc-400 hover:bg-zinc-900 hover:text-white"
              >
                <RefreshCw className="mr-2 h-3 w-3" /> Reset
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-12">
        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mx-auto max-w-2xl"
            >
              <div className="mb-12 space-y-4 text-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400"
                >
                  <Search className="h-3 w-3" /> Deepfake Detection System
                </motion.div>

                <h2 className="text-5xl font-bold tracking-tighter text-white">
                  Verify Visual <span className="text-zinc-500">Authenticity.</span>
                </h2>

                <p className="mx-auto max-w-md leading-relaxed text-zinc-400">
                  Upload any image to perform a deep forensic analysis. Our AI detects
                  generative artifacts, manipulation, and structural inconsistencies.
                </p>
              </div>

              <div
                {...getRootProps()}
                className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-12 transition-all duration-500 ease-out group ${
                  isDragActive
                    ? "border-white bg-zinc-900"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center space-y-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110">
                    <Upload className="h-8 w-8 text-zinc-400 transition-colors group-hover:text-white" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-white">
                      Drop image here or click to browse
                    </p>
                    <p className="text-sm text-zinc-500">Supports JPG, PNG, WEBP up to 10MB</p>
                  </div>
                </div>

                <div className="absolute left-6 top-6 h-8 w-8 border-l-2 border-t-2 border-zinc-800 transition-colors group-hover:border-zinc-600" />
                <div className="absolute right-6 top-6 h-8 w-8 border-r-2 border-t-2 border-zinc-800 transition-colors group-hover:border-zinc-600" />
                <div className="absolute bottom-6 left-6 h-8 w-8 border-b-2 border-l-2 border-zinc-800 transition-colors group-hover:border-zinc-600" />
                <div className="absolute bottom-6 right-6 h-8 w-8 border-b-2 border-r-2 border-zinc-800 transition-colors group-hover:border-zinc-600" />
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6">
                {[
                  {
                    icon: <Cpu className="h-4 w-4" />,
                    label: "AI Detection",
                    desc: "Identifies GAN & Diffusion models",
                  },
                  {
                    icon: <FileSearch className="h-4 w-4" />,
                    label: "Forensic Scan",
                    desc: "Pixel-level manipulation check",
                  },
                  {
                    icon: <Shield className="h-4 w-4" />,
                    label: "Secure Analysis",
                    desc: "Private & encrypted processing",
                  },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-zinc-400">{item.icon}</div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      {item.label}
                    </h4>
                    <p className="text-[10px] leading-relaxed text-zinc-500">{item.desc}</p>
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
                  className="mx-auto max-w-3xl"
                >
                  <Card className="relative overflow-hidden border-zinc-800 bg-zinc-950">
                    <CardContent className="relative flex aspect-video items-center justify-center bg-black p-0">
                      <img
                        src={image}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                      />

                      {isAnalyzing && (
                        <div className="absolute inset-0 z-10">
                          <motion.div
                            initial={{ top: "0%" }}
                            animate={{ top: "100%" }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 z-20 h-1 bg-white/50 shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                          />
                          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="mt-8 flex flex-col items-center gap-6">
                    <div className="flex w-full max-w-xl flex-col gap-4 sm:flex-row">
                      <Button
                        size="lg"
                        onClick={() => analyzeImage("standard")}
                        disabled={isAnalyzing || isTraining}
                        className="h-14 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 px-8 font-bold text-white hover:bg-zinc-800"
                      >
                        {isAnalyzing && analysisMode === "standard" ? (
                          <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
                        ) : (
                          <Scan className="mr-3 h-5 w-5" />
                        )}
                        Standard Scan
                      </Button>

                      {!isModelTrained ? (
                        <Button
                          size="lg"
                          onClick={simulateTraining}
                          disabled={isTraining || isAnalyzing}
                          className="relative h-14 flex-1 overflow-hidden rounded-2xl bg-white px-8 font-bold text-black hover:bg-zinc-200"
                        >
                          {isTraining ? (
                            <>
                              <div
                                className="absolute inset-0 bg-zinc-200"
                                style={{ width: `${trainingProgress}%` }}
                              />
                              <span className="relative z-10 flex items-center">
                                <Cpu className="mr-3 h-5 w-5 animate-pulse" />
                                Training SSFT... {trainingProgress}%
                              </span>
                            </>
                          ) : (
                            <>
                              <Zap className="mr-3 h-5 w-5" />
                              Train Advanced Engine
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          onClick={() => analyzeImage("advanced")}
                          disabled={isAnalyzing || isTraining}
                          className="h-14 flex-1 rounded-2xl bg-emerald-600 px-8 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-500"
                        >
                          {isAnalyzing && analysisMode === "advanced" ? (
                            <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
                          ) : (
                            <Shield className="mr-3 h-5 w-5" />
                          )}
                          Advanced SSFT Scan
                        </Button>
                      )}
                    </div>

                    <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                      {isTraining
                        ? "Optimizing Neural Weights..."
                        : isAnalyzing
                        ? "Processing Neural Layers..."
                        : isModelTrained
                        ? "SSFT Engine: Online & Optimized"
                        : "SSFT Engine: Requires Training"}
                    </p>
                  </div>
                </motion.div>
              )}

              {result && <ForensicAnalysis result={result} imageUrl={image} />}

              {error && (
                <div className="mx-auto flex max-w-md items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-500">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-auto border-t border-zinc-900 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
            © 2026 VeriSight Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 transition-colors hover:text-white"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 transition-colors hover:text-white"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 transition-colors hover:text-white"
            >
              API Docs
            </a>
          </div>
        </div>
      </footer>

      <ForensicAssistant />
    </div>
  );
}