import express from "express";
import path from "path";
import ytdl from "@distube/ytdl-core";
import { createServer as createViteServer } from "vite";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // API route for streaming YouTube audio
  app.get("/api/yt-audio", async (req, res) => {
    try {
      const videoId = req.query.v;
      if (!videoId || typeof videoId !== "string") {
        return res.status(400).json({ error: "Missing video id (v parameter)" });
      }

      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const info = await ytdl.getInfo(url);
      
      // Select the best audio format
      const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

      if (!audioFormat) {
        return res.status(404).json({ error: "No audio stream found" });
      }

      // Set headers for streaming audio
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Transfer-Encoding', 'chunked');
      
      const stream = ytdl(url, { format: audioFormat });
      
      stream.pipe(res);
      
      stream.on('error', (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });
      
      req.on('close', () => {
        stream.destroy();
      });

    } catch (err: any) {
      console.error("/api/yt-stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
