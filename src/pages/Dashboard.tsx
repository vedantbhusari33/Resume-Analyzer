import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, Briefcase, Send, Loader2, CheckCircle2, AlertCircle, Target } from "lucide-react";
import { Card, Button, Input } from "@/src/components/UI";

export default function Dashboard({ onAnalysisComplete }: { onAnalysisComplete: (data: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload your resume first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("targetRole", targetRole);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      onAnalysisComplete(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Analyze Your Resume</h2>
          <p className="text-white/50">Upload your resume and provide context for better results.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Upload className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-lg">Resume Upload</h3>
            </div>
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <label className="w-full cursor-pointer group">
                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                <div className={cn(
                  "border-2 border-dashed rounded-2xl p-10 transition-all",
                  file ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5"
                )}>
                  {file ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                      <p className="font-medium text-emerald-400">{file.name}</p>
                      <p className="text-xs text-white/40">Click to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 text-white/20 mx-auto group-hover:text-indigo-400 transition-colors" />
                      <p className="font-medium">Drop your resume here</p>
                      <p className="text-sm text-white/40">PDF, DOCX or TXT (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </Card>

          {/* Context Section */}
          <Card className="p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-lg">Target Context</h3>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Target Role</label>
                <Input 
                  placeholder="e.g. Senior Frontend Engineer" 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              <div className="space-y-2 flex-1 flex flex-col">
                <label className="text-sm font-medium text-white/70">Job Description (Optional)</label>
                <textarea 
                  className="w-full flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all min-h-[150px] resize-none"
                  placeholder="Paste the job description here for precise matching..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 text-rose-400"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !file}
            className="w-full max-w-md py-4 text-lg rounded-2xl"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Start Analysis
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

import { cn } from "@/src/lib/utils";
