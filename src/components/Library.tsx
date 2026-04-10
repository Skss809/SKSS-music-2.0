import React, { useRef, useState } from 'react';
import { usePlayerStore, LocalTrack } from '../store/usePlayerStore';
import { FolderOpen, Play, Image as ImageIcon, Sparkles } from 'lucide-react';
import { saveTrackImage, getTrackImage } from '../lib/idb';
import { generateArtworkPrompt } from '../lib/ai';

export function Library() {
  const { tracks, addTracks, setCurrentTrackIndex, updateTrackImage } = usePlayerStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsScanning(true);
    const newTracks: LocalTrack[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isAudio = file.type.startsWith('audio/');
      const isVideo = file.type.startsWith('video/');
      
      if (isAudio || isVideo) {
        // Basic metadata extraction
        const title = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        const id = `${file.name}-${file.size}`; // Simple hash
        
        // Check if we have a custom image in IDB
        let customImageUrl;
        try {
          const blob = await getTrackImage(id);
          if (blob) {
            customImageUrl = URL.createObjectURL(blob);
          }
        } catch (err) {
          console.error("Error reading from IDB", err);
        }

        newTracks.push({
          id,
          file,
          title,
          artist: "Unknown Artist",
          duration: 0, // We'll update this when it plays or via a background worker
          customImageUrl,
          isVideo
        });
      }
    }

    addTracks(newTracks);
    setIsScanning(false);
  };

  const handleImageUpload = async (trackId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    updateTrackImage(trackId, imageUrl);
    await saveTrackImage(trackId, file);
  };

  const handleGenerateArtwork = async (track: LocalTrack) => {
    setGeneratingFor(track.id);
    const prompt = await generateArtworkPrompt(track.title, track.artist);
    if (prompt) {
      alert(`AI Suggested Prompt for Image Generation:\n\n${prompt}\n\n(In a full production app, this would call an image generation API like Imagen to create the cover art directly.)`);
    }
    setGeneratingFor(null);
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Your Library</h2>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-zinc-200 transition-colors"
        >
          <FolderOpen size={18} />
          <span>Scan Local Folder</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFolderSelect} 
          className="hidden" 
          // @ts-ignore - webkitdirectory is non-standard but widely supported
          webkitdirectory="true" 
          directory="true" 
          multiple
        />
      </div>

      {isScanning && (
        <div className="text-zinc-400 mb-4 animate-pulse">Scanning files...</div>
      )}

      {tracks.length === 0 && !isScanning ? (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl px-4 text-center">
          <FolderOpen size={48} className="mb-4 opacity-50" />
          <p>No tracks found. Scan a folder to add music.</p>
          <p className="text-sm mt-2">Supports audio files and short video files.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {tracks.map((track, index) => (
            <div key={track.id} className="bg-zinc-900/50 p-3 md:p-4 rounded-xl hover:bg-zinc-800/80 transition-colors group relative">
              <div className="aspect-square bg-zinc-800 rounded-lg mb-3 md:mb-4 overflow-hidden relative shadow-lg">
                {track.customImageUrl ? (
                  <img src={track.customImageUrl} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <ImageIcon size={32} className="md:w-12 md:h-12" />
                  </div>
                )}
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => setCurrentTrackIndex(index)}
                    className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-xl"
                  >
                    <Play size={20} className="md:w-6 md:h-6 ml-1 fill-white" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-white font-medium text-sm md:text-base truncate" title={track.title}>{track.title}</h3>
              <p className="text-zinc-400 text-xs md:text-sm truncate">{track.artist}</p>
              
              <div className="mt-3 md:mt-4 flex flex-col md:flex-row items-stretch md:items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] md:text-xs text-zinc-300 py-1.5 rounded cursor-pointer transition-colors">
                  <ImageIcon size={12} className="md:w-3.5 md:h-3.5" />
                  <span>Cover</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(track.id, e)}
                  />
                </label>
                <button 
                  onClick={() => handleGenerateArtwork(track)}
                  disabled={generatingFor === track.id}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-[10px] md:text-xs py-1.5 rounded transition-colors disabled:opacity-50"
                >
                  <Sparkles size={12} className="md:w-3.5 md:h-3.5" />
                  <span>{generatingFor === track.id ? '...' : 'AI Art'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
