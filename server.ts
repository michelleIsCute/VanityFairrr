import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createInitialState, runGeminiEngine } from "./server/storyEngine.ts";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing
app.use(express.json());

// API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Start game endpoint
app.post("/api/story/start", (req, res) => {
  try {
    const { playerInfo } = req.body;
    if (!playerInfo || !playerInfo.name || !playerInfo.identityClass) {
      return res.status(400).json({ error: "Missing playerInfo details." });
    }
    const initialState = createInitialState(playerInfo);
    return res.json({ gameState: initialState });
  } catch (error: any) {
    console.error("Failed to start story:", error);
    return res.status(500).json({ error: error?.message || "Internal starting error" });
  }
});

// Play choice/response processing endpoint
app.post("/api/story/choice", async (req, res) => {
  try {
    const { gameState, choiceId, customText } = req.body;
    if (!gameState || !choiceId) {
      return res.status(400).json({ error: "Missing gameState or choiceId." });
    }
    const updatedState = await runGeminiEngine(gameState, choiceId, customText);
    return res.json({ gameState: updatedState });
  } catch (error: any) {
    console.error("Failed to process choice:", error);
    return res.status(500).json({ error: error?.message || "Internal choice processing error" });
  }
});

// Set up Vite / static file handlers
async function setupBuildAndMiddlewares() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Vanity Fair Server] Live on http://0.0.0.0:${PORT} under NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
}

setupBuildAndMiddlewares().catch((err) => {
  console.error("Critical server bootstrap error:", err);
});
