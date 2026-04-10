import React, { useState } from 'react';
import { Home, Library, Search, PlusSquare, Heart, Music2, ListMusic } from 'lucide-react';
import { cn } from '../lib/utils';
import { usePlayerStore } from '../store/usePlayerStore';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const { playlists, createPlaylist } = usePlayerStore();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'library', icon: Library, label: 'Your Library' },
  ];

  const handleCreate = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="hidden md:flex w-64 bg-zinc-950 h-full flex-col p-6 text-zinc-400">
      <div className="flex items-center gap-3 text-white mb-8 px-2">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Music2 size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">SKSS music</h1>
      </div>

      <nav className="space-y-4 mb-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={cn(
              "flex items-center gap-4 w-full px-2 py-1.5 font-medium transition-colors hover:text-white",
              currentView === item.id ? "text-white" : ""
            )}
          >
            <item.icon size={24} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="space-y-4 mb-6">
        {isCreating ? (
          <div className="px-2">
            <input 
              autoFocus
              type="text" 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              onBlur={() => setIsCreating(false)}
              placeholder="Playlist name..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        ) : (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-4 w-full px-2 py-1.5 font-medium transition-colors hover:text-white"
          >
            <div className="bg-zinc-300 text-black p-1 rounded-sm">
              <PlusSquare size={16} />
            </div>
            Create Playlist
          </button>
        )}
        <button className="flex items-center gap-4 w-full px-2 py-1.5 font-medium transition-colors hover:text-white">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-400 text-white p-1 rounded-sm">
            <Heart size={16} />
          </div>
          Liked Songs
        </button>
      </div>

      {/* Playlists List */}
      <div className="flex-1 overflow-y-auto border-t border-zinc-900 pt-4 space-y-2">
        {playlists.map(p => (
          <button 
            key={p.id}
            className="flex items-center gap-3 w-full px-2 py-1.5 text-sm transition-colors hover:text-white text-left truncate"
          >
            <ListMusic size={16} className="flex-shrink-0" />
            <span className="truncate">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-zinc-900">
        <div className="text-xs text-zinc-500 space-y-2">
          <p>AI Recommendations Active</p>
          <p>Local File Sync Enabled</p>
        </div>
      </div>
    </div>
  );
}
