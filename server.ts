import { GoogleGenAI } from "@google/genai";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import dotenv from "dotenv";
dotenv.config();

// Ensure we don't use the placeholder key from .env.example if a real one is available
if (process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
  delete process.env.GEMINI_API_KEY;
}

const pdf = require("pdf-parse");
import mammoth from "mammoth";
import betterSqlite3 from "better-sqlite3";
import express from "express";
import multer from "multer";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// --- Database Setup ---
const db = betterSqlite3("database.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    role TEXT,
    score INTEGER,
    ats_score INTEGER,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// --- AI Service ---
function getAIService() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is missing or invalid. Please ensure you have configured your API key in the AI Studio Secrets panel.");
  }
  return new GoogleGenAI({ apiKey });
}

async function analyzeResumeWithAI(resumeText: string, jobDescription?: string, targetRole?: string) {
  const ai = getAIService();
  // Using gemini-3.1-pro-preview for better reasoning on complex resume data
  const model = "gemini-3.1-pro-preview";
  
  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error("The resume content seems too short or could not be extracted correctly. Please try a different file.");
  }

  const prompt = `
    You are an expert career coach and ATS (Applicant Tracking System) specialist.
    Analyze the following resume text.
    ${targetRole ? `The target role is: ${targetRole}` : ""}
    ${jobDescription ? `The job description to match against is: ${jobDescription}` : ""}

    Provide a comprehensive analysis in JSON format with the following structure:
    {
      "resumeScore": number (0-100),
      "atsScore": number (0-100),
      "strengths": string[],
      "skillGaps": string[],
      "missingTools": string[],
      "bulletImprovements": { "original": string, "improved": string, "reason": string }[],
      "learningRoadmap": { "skill": string, "steps": string[], "estimatedTime": string }[],
      "matchPercentage": number (0-100),
      "suggestedProjects": { "title": string, "description": string, "skillsGained": string[] }[],
      "parsedResume": {
        "skills": string[],
        "experience": string[],
        "projects": string[],
        "education": string[]
      }
    }

    Resume Text:
    ${resumeText}

    Ensure the JSON is valid, strictly follows the schema, and the analysis is critical and helpful.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: "application/json",
        temperature: 0.2 // Lower temperature for more consistent JSON output
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI failed to generate a response. Please try again.");
    }

    // Clean the response text in case of markdown blocks
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    if (error.message?.includes("safety")) {
      throw new Error("The content was flagged by safety filters. Please ensure the resume contains professional content.");
    }
    throw error;
  }
}

// --- Server Setup ---
async function startServer() {
  const app = express();
  const upload = multer({ storage: multer.memoryStorage() });

  app.use(express.json());

  // API Routes
  app.post("/api/analyze", upload.single("resume"), async (req, res) => {
    try {
      const { targetRole, jobDescription } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No resume file uploaded" });
      }

      let resumeText = "";
      if (file.mimetype === "application/pdf") {
        // Handle both CJS and ESM export styles for pdf-parse
        const parsePdf = typeof pdf === "function" ? pdf : pdf.default;
        if (typeof parsePdf !== "function") {
          throw new Error("PDF parsing library failed to load correctly.");
        }
        const data = await parsePdf(file.buffer);
        resumeText = data.text;
      } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const data = await mammoth.extractRawText({ buffer: file.buffer });
        resumeText = data.value;
      } else {
        resumeText = file.buffer.toString("utf-8");
      }

      const analysis = await analyzeResumeWithAI(resumeText, jobDescription, targetRole);
      
      // Save to history
      const stmt = db.prepare("INSERT INTO analyses (filename, role, score, ats_score, data) VALUES (?, ?, ?, ?, ?)");
      stmt.run(file.originalname, targetRole || "General", analysis.resumeScore, analysis.atsScore, JSON.stringify(analysis));

      res.json(analysis);
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/history", (req, res) => {
    const rows = db.prepare("SELECT * FROM analyses ORDER BY created_at DESC").all();
    res.json(rows.map((row: any) => ({
      ...row,
      data: JSON.parse(row.data)
    })));
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist/index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
