import React from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  Download,
  Lightbulb,
  Map,
  Code2,
  Sparkles,
  Zap
} from "lucide-react";
import { Card, Button, Badge } from "@/src/components/UI";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import Markdown from "react-markdown";

export default function ResultsDashboard({ data, onBack }: { data: any; onBack: () => void }) {
  const scoreData = [
    { name: "Score", value: data.resumeScore },
    { name: "Remaining", value: 100 - data.resumeScore },
  ];

  const atsData = [
    { name: "Score", value: data.atsScore },
    { name: "Remaining", value: 100 - data.atsScore },
  ];

  const COLORS = ["#6366f1", "rgba(255,255,255,0.05)"];
  const ATS_COLORS = ["#10b981", "rgba(255,255,255,0.05)"];

  const handleDownloadReport = () => {
    const reportContent = `
# Resume Analysis Report
Score: ${data.resumeScore}/100
ATS Compatibility: ${data.atsScore}/100

## Strengths
${data.strengths.map((s: string) => `- ${s}`).join("\n")}

## Skill Gaps
${data.skillGaps.map((s: string) => `- ${s}`).join("\n")}

## AI Bullet Improvements
${data.bulletImprovements.map((item: any) => `
Original: ${item.original}
Improved: ${item.improved}
Reason: ${item.reason}
`).join("\n")}

## Learning Roadmap
${data.learningRoadmap.map((item: any) => `
### ${item.skill} (${item.estimatedTime})
${item.steps.map((step: string, i: number) => `${i + 1}. ${step}`).join("\n")}
`).join("\n")}

## Suggested Projects
${data.suggestedProjects.map((p: any) => `
### ${p.title}
${p.description}
Skills: ${p.skillsGained.join(", ")}
`).join("\n")}
    `;

    const blob = new Blob([reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Resume_Analysis_Report_${new Date().getTime()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDownloadReport} className="rounded-full">
            <Download className="w-4 h-4" /> Export Report (.md)
          </Button>
          <Button className="rounded-full">
            <Sparkles className="w-4 h-4" /> Share Results
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Score Cards */}
        <Card className="md:col-span-1 flex flex-col items-center justify-center py-10">
          <h3 className="text-white/50 text-sm font-medium mb-6">Resume Score</h3>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{data.resumeScore}</span>
              <span className="text-xs text-white/40">out of 100</span>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-1 flex flex-col items-center justify-center py-10">
          <h3 className="text-white/50 text-sm font-medium mb-6">ATS Compatibility</h3>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={atsData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {atsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ATS_COLORS[index % ATS_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{data.atsScore}</span>
              <span className="text-xs text-white/40">out of 100</span>
            </div>
          </div>
        </Card>

        {/* Strengths & Gaps */}
        <Card className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-semibold">Key Strengths</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.strengths.map((s: string, i: number) => (
              <Badge key={i} variant="success" className="py-1.5 px-3">{s}</Badge>
            ))}
          </div>
          <div className="pt-4 flex items-center gap-2 text-amber-400 border-t border-white/10">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold">Skill Gaps</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skillGaps.map((s: string, i: number) => (
              <Badge key={i} variant="warning" className="py-1.5 px-3">{s}</Badge>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Bullet Improvements */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-indigo-400">
            <Zap className="w-5 h-5" />
            <h2 className="text-2xl font-bold">AI Bullet Improvements</h2>
          </div>
          <div className="space-y-4">
            {data.bulletImprovements.map((item: any, i: number) => (
              <Card key={i} className="space-y-4 border-l-4 border-l-indigo-500">
                <div className="space-y-1">
                  <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Original</p>
                  <p className="text-white/60 italic">"{item.original}"</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-emerald-400 uppercase font-bold tracking-wider">Improved</p>
                  <p className="text-white font-medium">"{item.improved}"</p>
                </div>
                <div className="pt-2 flex items-start gap-2 text-xs text-white/40">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p>{item.reason}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Learning Roadmap */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-emerald-400">
            <Map className="w-5 h-5" />
            <h2 className="text-2xl font-bold">Learning Roadmap</h2>
          </div>
          <div className="space-y-4">
            {data.learningRoadmap.map((item: any, i: number) => (
              <Card key={i} className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-indigo-400">{item.skill}</h4>
                  <Badge className="bg-white/5">{item.estimatedTime}</Badge>
                </div>
                <ul className="space-y-2">
                  {item.steps.map((step: string, j: number) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-white/70">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-emerald-400">{j + 1}</span>
                      </div>
                      {step}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Projects */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-amber-400">
          <Code2 className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Suggested Projects to Boost Profile</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.suggestedProjects.map((project: any, i: number) => (
            <Card key={i} className="flex flex-col h-full">
              <h4 className="text-lg font-bold mb-3">{project.title}</h4>
              <p className="text-sm text-white/60 mb-6 flex-1">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.skillsGained.map((skill: string, j: number) => (
                  <Badge key={j} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
