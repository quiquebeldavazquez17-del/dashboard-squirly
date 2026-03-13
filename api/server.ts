import dotenv from "dotenv";
import path from "path";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
  });
}

import express, { Request, Response } from "express";
import cors from "cors";
import { getClockifyDashboardHours } from "../server/integrations/clockify.js";
import { fetchGoogleSheetRows } from "../server/integrations/googleSheets.js";
import { getSupabaseMetrics } from "../server/integrations/supabase.js";

const app = express();

app.use(cors());
app.use(express.json());

// Helper to define routes both with and without /api prefix
const addRoute = (routePath: string, handler: any) => {
  const cleanPath = routePath.startsWith("/") ? routePath : `/${routePath}`;
  app.get(cleanPath, handler);
  app.get(`/api${cleanPath}`, handler);
};

addRoute("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

addRoute("/debug-vars", (_req: Request, res: Response) => {
  res.json({
    CLOCKIFY_API_KEY: process.env.CLOCKIFY_API_KEY ? "SET (ends in " + process.env.CLOCKIFY_API_KEY.slice(-3) + ")" : "MISSING",
    CLOCKIFY_WORKSPACE_ID: process.env.CLOCKIFY_WORKSPACE_ID ? "SET" : "MISSING",
    CLOCKIFY_USER_ID_ADRI: process.env.CLOCKIFY_USER_ID_ADRI ? "SET" : "MISSING",
    CLOCKIFY_USER_ID_QUIQUE: process.env.CLOCKIFY_USER_ID_QUIQUE ? "SET" : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL ? "YES" : "NO"
  });
});

addRoute("/metrics", async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query as { start?: string; end?: string };
    console.log(`[Metrics] Range: ${start} - ${end}`);
    const clockify = await getClockifyDashboardHours({ start, end });
    res.json({ clockify });
  } catch (error: any) {
    console.error(`[Metrics ERROR]:`, error);
    res.status(500).json({ error: "Error fetching metrics", message: error.message });
  }
});

addRoute("/google-sheets", async (_req: Request, res: Response) => {
  try {
    const rows = await fetchGoogleSheetRows();
    res.json({ rows });
  } catch (error: any) {
    console.error("Error fetching Google Sheets:", error);
    res.status(500).json({ error: "Error fetching Google Sheets", message: error.message });
  }
});

addRoute("/supabase-metrics", async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query as { start?: string; end?: string };
    const metrics = await getSupabaseMetrics(start, end);
    res.json(metrics);
  } catch (error: any) {
    console.error("Error fetching Supabase metrics:", error);
    res.status(500).json({ error: "Error fetching Supabase metrics", message: error.message });
  }
});

// For local testing
const PORT = Number(process.env.PORT || 3000);
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
  });
}

export default app;