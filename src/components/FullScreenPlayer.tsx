import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, Play, Pause, SkipBack, SkipForward, 
  Shuffle, Repeat, MoreVertical, Cast,
  RotateCcw, RotateCw
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Slider } from './Slider';

export function FullScreenPlayer() {
  const { 
    queue, 
    currentTrackIndex, 
    isPlaying, 
    setIsPlaying, 
    nextTrack, 
    prevTrack, 
    isShuffle, 
    toggleShuffle, 
    isRepeat, 
    toggleRepeat,
    isExpanded,
    setIsExpanded,
    progress,
    duration,
    isBuffering,
    setSeekTo
  } = usePlayerStore();

  const [activeTab, setActiveTab] = useState('LYRICS');
  const [mode, setMode] = useState<'song' | 'video'>('song');

  const currentTrack = queue[currentTrackIndex];

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (val: number[]) => {
    setSeekTo(val[0]);
  };

  const skip10 = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, progress + seconds));
    setSeekTo(newTime);
  };

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[100] bg-[#1a0505] flex flex-col overflow-hidden text-white h-[100dvh] touch-none"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#3d0a0a] via-[#1a0505] to-[#000000]" />
          
          {/* Header */}
          <header className="relative z-10 flex items-center justify-between px-4 pt-6 pb-2">
            <button 
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <ChevronDown size={24} />
            </button>
            
            <div className="flex bg-white/10 rounded-full p-1 backdrop-blur-md">
              <button 
                onClick={() => setMode('song')}
                className={`px-5 py-1 rounded-full text-[10px] font-bold transition-all ${mode === 'song' ? 'bg-white/20 text-white shadow-lg' : 'text-zinc-400'}`}
              >
                Song
              </button>
              <button 
                onClick={() => setMode('video')}
                className={`px-5 py-1 rounded-full text-[10px] font-bold transition-all ${mode === 'video' ? 'bg-white/20 text-white shadow-lg' : 'text-zinc-400'}`}
              >
                Video
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <Cast size={20} />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="relative z-10 flex-1 flex flex-col px-6 pt-2 pb-2 overflow-hidden">
            {/* Cover Art Container */}
            <div className="flex-1 flex items-center justify-center min-h-0 py-2">
              <div className="w-full aspect-square max-w-[260px] xs:max-w-[300px]">
                <motion.div 
                  layoutId="player-art"
                  className="w-full h-full rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
                >
                  {currentTrack.customImageUrl ? (
                    <img 
                      src={currentTrack.customImageUrl} 
                      alt={currentTrack.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                      <Play size={40} className="text-zinc-800 fill-zinc-800" />
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Track Info & Controls Group */}
            <div className="flex flex-col mt-auto shrink-0">
              {/* Track Info */}
              <div className="mb-4 text-center">
                <h2 className="text-lg font-bold mb-0.5 tracking-tight truncate px-4">{currentTrack.title}</h2>
                <p className="text-zinc-400 font-medium text-xs truncate px-4">{currentTrack.artist}</p>
              </div>

              {/* Progress Slider */}
              <div className="mb-4 px-2">
                <Slider 
                  value={[progress]} 
                  max={duration || 100} 
                  step={0.1} 
                  onValueChange={handleSeek}
                  className="mb-2"
                />
                <div className="flex justify-between text-[9px] font-bold text-zinc-400 font-mono">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-between px-1 mb-4">
                <button 
                  onClick={toggleShuffle}
                  className={`transition-colors ${isShuffle ? 'text-white' : 'text-zinc-600'}`}
                >
                  <Shuffle size={18} />
                </button>
                
                <div className="flex items-center gap-2 xs:gap-5">
                  <button 
                    onClick={() => skip10(-10)}
                    className="text-zinc-400 hover:text-white transition-colors flex flex-col items-center group"
                  >
                    <RotateCcw size={20} className="group-active:scale-90 transition-transform" />
                    <span className="text-[8px] font-bold mt-0.5">10</span>
                  </button>

                  <button 
                    onClick={prevTrack}
                    className="text-white active:scale-90 transition-transform"
                  >
                    <SkipBack size={26} fill="currentColor" />
                  </button>
                  
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-2xl"
                  >
                    {isBuffering ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />
                    )}
                  </button>
                  
                  <button 
                    onClick={nextTrack}
                    className="text-white active:scale-90 transition-transform"
                  >
                    <SkipForward size={26} fill="currentColor" />
                  </button>

                  <button 
                    onClick={() => skip10(10)}
                    className="text-zinc-400 hover:text-white transition-colors flex flex-col items-center group"
                  >
                    <RotateCw size={20} className="group-active:scale-90 transition-transform" />
                    <span className="text-[8px] font-bold mt-0.5">10</span>
                  </button>
                </div>

                <button 
                  onClick={toggleRepeat}
                  className={`transition-colors ${isRepeat ? 'text-white' : 'text-zinc-600'}`}
                >
                  <Repeat size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Tabs */}
          <footer className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-white/5 pb-safe">
            <div className="flex items-center justify-around py-3">
              {['UP NEXT', 'LYRICS', 'RELATED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[10px] font-bold tracking-[0.1em] transition-all duration-300 ${activeTab === tab ? 'text-white scale-110' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Home Indicator (iOS style) */}
            <div className="h-1 w-24 bg-white/10 mx-auto rounded-full mb-2" />
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
