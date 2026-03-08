import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { History, Calendar, FileText, ChevronRight, TrendingUp } from "lucide-react";
import { Card, Badge, Button } from "@/src/components/UI";

export default function HistoryPage({ onSelect }: { onSelect: (data: any) => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analysis History</h2>
          <p className="text-white/50">Track your progress and resume improvements over time.</p>
        </div>
        <Card className="py-3 px-6 flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-white/40 uppercase font-bold">Average Score</p>
            <p className="text-xl font-bold text-indigo-400">
              {history.length > 0 
                ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length)
                : 0}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-emerald-400" />
        </Card>
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ x: 4 }}
            onClick={() => onSelect(item.data)}
            className="cursor-pointer"
          >
            <Card className="p-4 flex items-center gap-6 hover:bg-white/[0.08] transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold truncate">{item.filename}</h4>
                <div className="flex items-center gap-4 text-sm text-white/40 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <Badge variant="default" className="bg-white/5 border border-white/10">
                    {item.role}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-8 px-6 border-x border-white/10">
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase font-bold">Score</p>
                  <p className={cn(
                    "text-xl font-bold",
                    item.score >= 80 ? "text-emerald-400" : item.score >= 60 ? "text-amber-400" : "text-rose-400"
                  )}>{item.score}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase font-bold">ATS</p>
                  <p className="text-xl font-bold text-white/80">{item.ats_score}</p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-white/20" />
            </Card>
          </motion.div>
        ))}

        {history.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
            <History className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No analysis history found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { cn } from "@/src/lib/utils";
