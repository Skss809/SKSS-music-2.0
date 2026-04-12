import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Mic2, ListMusic, Maximize2 } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { cn } from '../lib/utils';
import { FullScreenPlayer } from './FullScreenPlayer';

export function PlayerBar() {
  const { 
    tracks, currentTrackIndex, isPlaying, volume, 
    isShuffle, isRepeat, setIsPlaying, setVolume, 
    toggleShuffle, toggleRepeat, nextTrack, prevTrack,
    setIsExpanded, setProgress: setStoreProgress, setDuration: setStoreDuration,
    setIsBuffering,
    progress, duration, seekTo, setSeekTo
  } = usePlayerStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = currentTrackIndex >= 0 ? tracks[currentTrackIndex] : null;

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      let url = '';
      if (currentTrack.file) {
        url = URL.createObjectURL(currentTrack.file as Blob);
      } else if (currentTrack.streamUrl) {
        url = currentTrack.streamUrl;
      }
      
      if (url) {
        audioRef.current.src = url;
        if (isPlaying) {
          audioRef.current.play().catch(e => console.error("Playback failed:", e));
        }
      }
      
      return () => {
        if (currentTrack.file && url) URL.revokeObjectURL(url);
      };
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && seekTo !== null) {
      audioRef.current.currentTime = seekTo;
      setSeekTo(null);
    }
  }, [seekTo]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setStoreProgress(audioRef.current.currentTime);
      setStoreDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setStoreProgress(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <div className="h-16 md:h-24 bg-zinc-950 border-t border-zinc-900 flex items-center justify-center text-zinc-500 text-sm md:text-base z-50">
        Select a track to start playing
      </div>
    );
  }

  return (
    <div className="h-16 md:h-24 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between px-2 md:px-4 z-50 relative">
      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        preload="auto"
      />
      
      {/* Mobile Progress Bar (Absolute Top) */}
      <div className="absolute top-0 left-0 right-0 h-[2px] md:hidden bg-zinc-800">
         <div className="h-full bg-indigo-500" style={{ width: `${(progress / (duration || 1)) * 100}%` }} />
         <input 
           type="range" 
           min={0} max={duration || 100} value={progress} onChange={handleSeek}
           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
         />
      </div>

      {/* Track Info */}
      <div 
        className="flex items-center gap-3 md:gap-4 w-1/2 md:w-1/4 min-w-0 md:min-w-[180px] cursor-pointer group"
        onClick={() => setIsExpanded(true)}
      >
        <div className="w-10 h-10 md:w-14 md:h-14 bg-zinc-800 rounded-md overflow-hidden flex-shrink-0 relative">
          {currentTrack.customImageUrl ? (
            <img src={currentTrack.customImageUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
              <ListMusic size={20} className="md:w-6 md:h-6" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Maximize2 size={18} className="text-white" />
          </div>
        </div>
        <div className="overflow-hidden min-w-0">
          <h4 className="text-white text-sm font-medium truncate group-hover:underline">{currentTrack.title}</h4>
          <p className="text-zinc-400 text-xs truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-[40%] gap-1 md:gap-2">
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={toggleShuffle} className={cn("hidden md:block text-zinc-400 hover:text-white transition", isShuffle && "text-indigo-500")}>
            <Shuffle size={18} />
          </button>
          <button onClick={prevTrack} className="hidden md:block text-zinc-400 hover:text-white transition">
            <SkipBack size={20} />
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition flex-shrink-0"
          >
            {isPlaying ? <Pause size={18} className="fill-black" /> : <Play size={18} className="fill-black ml-1" />}
          </button>
          <button onClick={nextTrack} className="text-zinc-400 hover:text-white transition">
            <SkipForward size={20} />
          </button>
          <button onClick={toggleRepeat} className={cn("hidden md:block text-zinc-400 hover:text-white transition", isRepeat && "text-indigo-500")}>
            <Repeat size={18} />
          </button>
        </div>
        
        <div className="hidden md:flex items-center gap-2 w-full text-xs text-zinc-400 font-mono">
          <span>{formatTime(progress)}</span>
          <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            value={progress} 
            onChange={handleSeek}
            className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="hidden md:flex items-center justify-end gap-4 w-1/4 min-w-[180px]">
        <button className="text-zinc-400 hover:text-white transition">
          <Mic2 size={18} />
        </button>
        <div className="flex items-center gap-2 w-24">
          <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="text-zinc-400 hover:text-white transition">
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input 
            type="range" 
            min={0} 
            max={1} 
            step={0.01}
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
