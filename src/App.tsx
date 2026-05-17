import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { auth } from './firebase';
import { loadLibraryFromFirebase } from './lib/sync';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { Library } from './components/Library';
import { Home } from './components/Home';
import { Search } from './components/Search';
import { AuthButton } from './components/AuthButton';
import { BottomNav } from './components/BottomNav';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { Music2, Settings as SettingsIcon } from 'lucide-react';
import { usePlayerStore } from './store/usePlayerStore';
import { useSettingsStore } from './store/useSettingsStore';
import { SettingsDialog } from './components/SettingsDialog';

import { GlobalPlayer } from './components/GlobalPlayer';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { loadSavedData, addTracks } = usePlayerStore();
  const { background, backgroundOpacity, blurBackground } = useSettingsStore();

  useEffect(() => {
    loadSavedData();
    
    // Auth Listener for Firebase track syncing
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const remoteTracks = await loadLibraryFromFirebase();
          if (remoteTracks && remoteTracks.length > 0) {
            addTracks(remoteTracks);
          }
          
          const { loadPlaylistsFromFirebase } = await import('./lib/sync');
          const remotePlaylists = await loadPlaylistsFromFirebase();
          if (remotePlaylists && remotePlaylists.length > 0) {
            usePlayerStore.setState({ playlists: remotePlaylists });
          }
          
          const { loadSettingsFromFirebase } = await import('./lib/sync');
          const settings = await loadSettingsFromFirebase();
          if (settings) {
            const { setBackground, setBackgroundOpacity, setBlurBackground } = useSettingsStore.getState();
            if (settings.background !== undefined) setBackground(settings.background);
            if (settings.backgroundOpacity !== undefined) setBackgroundOpacity(settings.backgroundOpacity);
            if (settings.blurBackground !== undefined) setBlurBackground(settings.blurBackground);
          }
        } catch(e) {
          console.error("Failed to fetch remote tracks", e);
        }
      }
    });

    // Removed BackgroundMode since it causes crashes on modern Android without permissions
    
    return () => unsubscribe();
  }, [loadSavedData, addTracks]);

  useEffect(() => {
    // Only try to sync if auth.currentUser exists and settings loaded
    if (auth.currentUser) {
       import('./lib/sync').then(({ syncSettingsToFirebase }) => {
         syncSettingsToFirebase({ background, backgroundOpacity, blurBackground });
       });
    }
  }, [background, backgroundOpacity, blurBackground]);

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden font-sans selection:bg-indigo-500/30 relative">
      {/* Custom Background Layer */}
      {background && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
          style={{ opacity: backgroundOpacity }}
        >
          <img 
            src={background} 
            alt="" 
            className="w-full h-full object-cover"
            onLoad={(e) => (e.currentTarget.style.opacity = '1')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          openSettings={() => setIsSettingsOpen(true)}
        />
        
        <main className={`flex-1 flex flex-col relative ${blurBackground ? 'bg-zinc-900/40 backdrop-blur-sm' : 'bg-transparent'} overflow-hidden md:rounded-tl-2xl md:border-l md:border-t border-zinc-800/50`}>
          {/* Top Bar */}
          <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 bg-black/20 backdrop-blur-md z-20">
            <div className="md:hidden flex items-center gap-2 text-white font-bold tracking-tight">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Music2 size={18} />
              </div>
              SKSS music
            </div>
            <div className="hidden md:block"></div>
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <SettingsIcon size={20} />
              </button>
              <AuthButton />
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            {currentView === 'home' && <Home />}
            {currentView === 'library' && <Library />}
            {currentView === 'search' && <Search />}
          </div>
        </main>
      </div>
      
      <PlayerBar />
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      <FullScreenPlayer />
      <GlobalPlayer />
      
      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
      />
    </div>
  );
}
