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
const router = express.Router();

app.use(cors());
app.use(express.json());

router.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

router.get("/test-google", (_req: Request, res: Response) => {
  res.json({ ok: true, route: "google route loaded" });
});

router.get("/debug-vars", (_req: Request, res: Response) => {
  res.json({
    CLOCKIFY_API_KEY: process.env.CLOCKIFY_API_KEY ? "SET (ends in " + process.env.CLOCKIFY_API_KEY.slice(-3) + ")" : "MISSING",
    CLOCKIFY_WORKSPACE_ID: process.env.CLOCKIFY_WORKSPACE_ID ? "SET" : "MISSING",
    CLOCKIFY_USER_ID_ADRI: process.env.CLOCKIFY_USER_ID_ADRI ? "SET" : "MISSING",
    CLOCKIFY_USER_ID_QUIQUE: process.env.CLOCKIFY_USER_ID_QUIQUE ? "SET" : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
  });
});

router.get("/clockify-users", async (_req: Request, res: Response) => {
  try {
    const apiKey = process.env.CLOCKIFY_API_KEY;
    const workspaceId = process.env.CLOCKIFY_WORKSPACE_ID;

    if (!apiKey) {
      return res.status(500).json({ error: "CLOCKIFY_API_KEY is not set" });
    }
    if (!workspaceId) {
      return res.status(500).json({ error: "CLOCKIFY_WORKSPACE_ID is not set" });
    }

    const apiBase = process.env.CLOCKIFY_API_BASE ?? "https://api.clockify.me/api/v1";
    const url = `${apiBase}/workspaces/${workspaceId}/users`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Clockify users API error:", response.status, response.statusText, text);
      return res.status(502).json({
        error: "Failed to fetch Clockify users",
        status: response.status,
      });
    }

    const data = (await response.json()) as any[];

    if (!Array.isArray(data)) {
      console.error("Unexpected Clockify users response shape:", data);
      return res.status(502).json({
        error: "Unexpected Clockify users response shape",
      });
    }

    const users = data.map((user) => ({
      id: user.id,
      name: user.name ?? user.displayName ?? "",
      email: user.email ?? "",
    }));

    res.json({ users });
  } catch (error: any) {
    console.error("Error fetching Clockify users:", error);
    res.status(500).json({
      error: "Error fetching Clockify users",
      message: error.message ?? "Unknown error",
    });
  }
});

router.get("/metrics", async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query as { start?: string; end?: string };

    console.log(`[Metrics] Fetching for range: ${start} - ${end}`);
    const clockify = await getClockifyDashboardHours({ start, end });
    console.log(`[Metrics] Clockify result found`);
    res.json({ clockify });
  } catch (error: any) {
    console.error(`[Metrics ERROR]:`, error);
    res.status(500).json({
      error: "Error fetching metrics",
      message: error.message,
    });
  }
});

router.get("/google-sheets", async (_req: Request, res: Response) => {
  try {
    const rows = await fetchGoogleSheetRows();
    res.json({ rows });
  } catch (error: any) {
    console.error("Error fetching Google Sheets:", error);
    res.status(500).json({
      error: "Error fetching Google Sheets",
      message: error.message,
    });
  }
});

router.get("/supabase-metrics", async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query as { start?: string; end?: string };
    const metrics = await getSupabaseMetrics(start, end);
    res.json(metrics);
  } catch (error: any) {
    console.error("Error fetching Supabase metrics:", error);
    res.status(500).json({
      error: "Error fetching Supabase metrics",
      message: error.message,
    });
  }
});

app.use("/api", router);
app.use("/", router);

const PORT = Number(process.env.PORT || 3000);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
    console.log("✅ Routes loaded");
  });
}

export default app;