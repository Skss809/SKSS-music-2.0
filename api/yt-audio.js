const ytdl = require('@distube/ytdl-core');

module.exports = async function handler(req, res) {
  try {
    const videoId = req.query.v;
    if (!videoId || typeof videoId !== "string") {
      return res.status(400).json({ error: "Missing video id (v parameter)" });
    }

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(url);
    
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

    if (!audioFormat) {
      return res.status(404).json({ error: "No audio stream found" });
    }

    // Since this is Vercel Serverless, we can pipe the audio directly
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    // Enable CORS for Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    const stream = ytdl(url, { format: audioFormat });
    
    stream.pipe(res);
    
    stream.on('error', (err) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).end();
      }
    });

  } catch (err) {
    console.error("/api/yt-audio error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
};
