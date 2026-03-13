import dotenv from "dotenv";
import path from "path";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
  });
}

import express, { Request, Response } from "express";
import cors from "cors";
import { getClockifyDashboardHours } from "./integrations/clockify";
import { fetchGoogleSheetRows } from "./integrations/googleSheets";
import { getSupabaseMetrics } from "./integrations/supabase";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.get("/api/test-google", (_req: Request, res: Response) => {
  res.json({ ok: true, route: "google route loaded" });
});

app.get("/api/clockify-users", async (_req: Request, res: Response) => {
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

app.get("/api/metrics", async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query as { start?: string; end?: string };

    const clockify = await getClockifyDashboardHours({ start, end });

    res.json({ clockify });
  } catch (error: any) {
    console.error("Error getting metrics:", error);
    res.status(500).json({
      error: "Error fetching metrics",
      message: error.message,
    });
  }
});

app.get("/api/google-sheets", async (_req: Request, res: Response) => {
  try {
    const rows = await fetchGoogleSheetRows();
    res.json({ rows });
  } catch (error: any) {
    console.error("Error fetching Google Sheets:", error);
    res.status(500).json({
      error: "Error fetching Google Sheets",
      message: error.message ?? "Unknown error",
    });
  }
});

app.get("/api/supabase-metrics", async (req: Request, res: Response) => {
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

const PORT = Number(process.env.PORT || 3000);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
    console.log("✅ Routes loaded: /api/health, /api/test-google, /api/clockify-users, /api/metrics, /api/google-sheets, /api/supabase-metrics");
  });
}

export default app;