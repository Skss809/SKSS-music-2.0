import React, { useRef, useEffect, useState } from 'react';
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
    isExpanded, videoBounds
  } = usePlayerStore();
  
  const playerRef = useRef<any>(null);
  const currentTrack = currentTrackIndex >= 0 ? queue[currentTrackIndex] : null;

  useEffect(() => {
    if (seekTo !== null && playerRef.current && currentTrack?.isVideo) {
      playerRef.current.seekTo(seekTo, 'seconds');
      setSeekTo(null);
    }
  }, [seekTo, currentTrack?.isVideo]);

  const lastBounds = useRef<{ top: number, left: number, width: number, height: number } | null>(null);
  
  useEffect(() => {
    if (videoBounds) {
      lastBounds.current = videoBounds;
    }
  }, [videoBounds]);

  const [localVideoUrl, setLocalVideoUrl] = useState<string | undefined>();

  useEffect(() => {
    if (currentTrack?.isVideo && currentTrack.file) {
      const url = URL.createObjectURL(currentTrack.file as Blob);
      setLocalVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setLocalVideoUrl(undefined);
    }
  }, [currentTrack]);

  const activeBounds = isExpanded ? videoBounds : lastBounds.current;
  
  const expandedStyle = (currentTrack?.isVideo && activeBounds) ? {
    top: activeBounds.top,
    left: activeBounds.left,
    width: activeBounds.width,
    height: activeBounds.height,
  } : {};

  return (
    <div 
      className={cn(
        "fixed transition-all duration-500 z-[104]",
        (!isExpanded || !currentTrack?.isVideo) && "opacity-0"
      )}
      style={{
        ...expandedStyle,
        ...((!isExpanded || !currentTrack?.isVideo) && !activeBounds ? { top: -9999, left: -9999 } : {})
      }}
    >
      <div className={cn(
        "relative w-full h-full bg-black overflow-hidden rounded-2xl shadow-2xl transition-all duration-500",
        isExpanded && currentTrack?.isVideo ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        {currentTrack?.isVideo && (
          <Player
            ref={playerRef}
            url={currentTrack.streamUrl || localVideoUrl}
            playing={isPlaying}
            volume={volume}
            width="177.77%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}
            onProgress={(state: any) => setProgress(state.playedSeconds)}
            onDuration={(d: number) => setDuration(d)}
            onEnded={nextTrack}
            playsinline={true}
            onBuffer={() => setIsBuffering(true)}
            onBufferEnd={() => setIsBuffering(false)}
            onError={(e: any) => {
              console.error("YouTube Error:", e);
              setIsBuffering(false);
            }}
            config={{
              youtube: {
                playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1, origin: window.location.origin }
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
