import React, { useEffect, useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { getRecommendations } from '../lib/ai';
import { Sparkles, Play } from 'lucide-react';
import { Visualizer } from './Visualizer';

export function Home() {
  const { tracks, currentTrackIndex, setCurrentTrackIndex } = usePlayerStore();
  const [recommendations, setRecommendations] = useState<{title: string, artist: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchRecommendations() {
      if (tracks.length > 0) {
        setIsLoading(true);
        // Use up to 5 random tracks from library to seed recommendations
        const seedTracks = [...tracks].sort(() => 0.5 - Math.random()).slice(0, 5).map(t => ({ title: t.title, artist: t.artist }));
        const recs = await getRecommendations(seedTracks);
        setRecommendations(recs);
        setIsLoading(false);
      }
    }
    fetchRecommendations();
  }, [tracks.length]);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-6 md:mb-8">Good Evening</h2>
      
      {/* Recently Played / Quick Picks */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-12">
        {tracks.slice(0, 6).map((track, index) => (
          <div 
            key={track.id} 
            className="flex items-center gap-3 md:gap-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-md overflow-hidden cursor-pointer transition-colors group"
            onClick={() => setCurrentTrackIndex(index)}
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-700 flex-shrink-0 relative">
              {track.customImageUrl && <img src={track.customImageUrl} alt={track.title} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play size={20} className="fill-white text-white ml-1" />
              </div>
            </div>
            <div className="font-medium text-white text-sm md:text-base truncate pr-2 md:pr-4">{track.title}</div>
          </div>
        ))}
      </div>

      {/* Visualizer */}
      <div className="mb-8 md:mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-4 md:mb-6">Now Playing</h2>
        <Visualizer />
      </div>

      {/* AI Recommendations */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 md:mb-6">
          <Sparkles className="text-indigo-400" size={20} className="md:w-6 md:h-6" />
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">AI Recommended For You</h2>
        </div>
        
        {isLoading ? (
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-36 md:w-48 flex-shrink-0 animate-pulse snap-start">
                <div className="aspect-square bg-zinc-800 rounded-xl mb-3 md:mb-4"></div>
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x">
            {recommendations.map((rec, i) => (
              <div key={i} className="w-36 md:w-48 flex-shrink-0 group cursor-pointer snap-start">
                <div className="aspect-square bg-gradient-to-br from-indigo-900 to-zinc-900 rounded-xl mb-3 md:mb-4 relative overflow-hidden shadow-lg">
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-500/20">
                    <Sparkles size={48} className="md:w-16 md:h-16" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl">
                      <Play size={20} className="md:w-6 md:h-6 ml-1 fill-white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-medium text-sm md:text-base truncate">{rec.title}</h3>
                <p className="text-zinc-400 text-xs md:text-sm truncate">{rec.artist}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-zinc-500 text-sm md:text-base bg-zinc-900/50 p-4 md:p-6 rounded-xl border border-zinc-800">
            Scan some local files to get personalized AI recommendations.
          </div>
        )}
      </div>
    </div>
  );
}
