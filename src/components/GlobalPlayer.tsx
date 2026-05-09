import React, { useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { usePlayerStore } from '../store/usePlayerStore';
import { cn } from '../lib/utils';

export function GlobalPlayer() {
  const Player = ReactPlayer as any;
  const { 
    queue, currentTrackIndex, isPlaying, volume, 
    nextTrack, setIsBuffering,
    setProgress, setDuration,
    seekTo, setSeekTo,
    isExpanded
  } = usePlayerStore();
  
  const playerRef = useRef<any>(null);
  const currentTrack = currentTrackIndex >= 0 ? queue[currentTrackIndex] : null;

  useEffect(() => {
    if (seekTo !== null && playerRef.current && currentTrack?.isVideo) {
      playerRef.current.seekTo(seekTo);
      setSeekTo(null);
    }
  }, [seekTo, currentTrack?.isVideo]);

  if (!currentTrack || !currentTrack.isVideo) return null;

  return (
    <div className={cn(
      "fixed pointer-events-none transition-all duration-500 z-[101]",
      isExpanded 
        ? "inset-0 flex items-center justify-center p-6 md:p-12" 
        : "top-[-1000px] left-[-1000px] w-[300px] h-[300px] opacity-0 overflow-hidden"
    )}>
      <div className={cn(
        "relative w-full shadow-2xl transition-all duration-500 bg-black overflow-hidden",
        isExpanded ? "aspect-video md:aspect-square max-w-[500px] rounded-2xl pointer-events-auto" : "w-full h-full"
      )}>
        <Player
          ref={playerRef}
          url={currentTrack.streamUrl}
          playing={isPlaying}
          volume={volume}
          width="100%"
          height="100%"
          onProgress={(state: any) => setProgress(state.playedSeconds)}
          onDuration={(d: number) => setDuration(d)}
          onEnded={nextTrack}
          onBuffer={() => setIsBuffering(true)}
          onBufferEnd={() => setIsBuffering(false)}
          onError={(e: any) => {
            console.error("YouTube Error:", e);
            setIsBuffering(false);
          }}
          config={{
            youtube: {
              playerVars: { autoplay: 1, rel: 0, modestbranding: 1, origin: window.location.origin }
            }
          }}
        />
      </div>
    </div>
  );
}
