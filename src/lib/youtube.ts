import { LocalTrack } from '../store/usePlayerStore';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "AIzaSyAAoUmyIgmb_qDueokjd0cnIgQIgPFKgIw";

export async function searchYouTube(query: string): Promise<LocalTrack[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn("YouTube API Key not found. Please add VITE_YOUTUBE_API_KEY to your env.");
    return [];
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "YouTube API error");
    }

    if (!data.items) return [];

    const baseUrl = window.location.origin.includes('localhost') || window.location.protocol === 'capacitor:' 
      ? 'https://ais-pre-tn4pxmdr4icvzdpqtd7ohb-550584511807.asia-southeast1.run.app' 
      : window.location.origin;

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      duration: 0, // YouTube search doesn't return duration, would need another call
      customImageUrl: item.snippet.thumbnails.high.url,
      streamUrl: `${baseUrl}/api/yt-audio?v=${item.id.videoId}`,
      isVideo: false,
      source: 'youtube'
    }));
  } catch (error) {
    console.error("YouTube search error:", error);
    throw error;
  }
}
