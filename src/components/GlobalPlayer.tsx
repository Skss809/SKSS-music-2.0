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
        : "bottom-4 left-4 w-0 h-0 opacity-0 overflow-hidden"
    )}>
      <div className={cn(
        "relative w-full shadow-2xl transition-all duration-500 bg-black overflow-hidden pointer-events-auto",
        isExpanded ? "aspect-video md:aspect-square max-w-[500px] rounded-2xl" : "w-0 h-0"
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
          config={{
            youtube: {
              playerVars: { autoplay: 1, rel: 0, modestbranding: 1 }
            }
          }}
        />
      </div>
    </div>
  );
}
