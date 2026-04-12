import { GoogleGenAI } from '@google/genai';

let ai: any = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
      return null;
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function getRecommendations(recentTracks: { title: string, artist: string }[]) {
  const aiInstance = getAI();
  if (!aiInstance || recentTracks.length === 0) return [];
  
  const prompt = `Based on these recently played tracks:
${recentTracks.map(t => `- ${t.title} by ${t.artist}`).join('\n')}

Suggest 5 similar songs that the user might like. 
Return ONLY a JSON array of objects with "title" and "artist" properties. No markdown formatting, just the raw JSON array.`;

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    
    const text = response.text || '[]';
    // Clean up potential markdown code blocks
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
}

export async function generateArtworkPrompt(title: string, artist: string) {
  const aiInstance = getAI();
  if (!aiInstance) return '';

  const prompt = `Create a detailed image generation prompt for an album cover for the song "${title}" by "${artist}". The prompt should describe a visually stunning, modern, and artistic scene that captures the mood of the song. Return ONLY the prompt text.`;
  
  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error("Error generating artwork prompt:", error);
    return '';
  }
}
