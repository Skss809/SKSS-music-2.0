import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { Library } from './components/Library';
import { Home } from './components/Home';
import { Search } from './components/Search';
import { AuthButton } from './components/AuthButton';
import { BottomNav } from './components/BottomNav';
import { Music2 } from 'lucide-react';
import { usePlayerStore } from './store/usePlayerStore';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const { loadSavedData } = usePlayerStore();

  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        
        <main className="flex-1 flex flex-col relative bg-zinc-900 overflow-hidden md:rounded-tl-xl md:border-l md:border-t border-zinc-800">
          {/* Top Bar */}
          <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 bg-zinc-900/80 backdrop-blur-md z-10">
            <div className="md:hidden flex items-center gap-2 text-white font-bold tracking-tight">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Music2 size={18} />
              </div>
              SKSS music
            </div>
            <div className="hidden md:block"></div>
            <AuthButton />
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
    </div>
  );
}
