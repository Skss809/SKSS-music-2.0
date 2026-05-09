import { LocalTrack } from '../store/usePlayerStore';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export async function searchYouTube(query: string): Promise<LocalTrack[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn("YouTube API Key not found. Please add VITE_YOUTUBE_API_KEY to your env.");
    return [];
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      duration: 0, // YouTube search doesn't return duration, would need another call
      customImageUrl: item.snippet.thumbnails.high.url,
      streamUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      isVideo: true
    }));
  } catch (error) {
    console.error("YouTube search error:", error);
    return [];
  }
}
