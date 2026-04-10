import React, { useState } from 'react';
import { Search as SearchIcon, Download, Play, Plus, Check, X } from 'lucide-react';
import { searchAudius } from '../lib/audius';
import { usePlayerStore, LocalTrack } from '../store/usePlayerStore';
import { saveTrackToDB } from '../lib/idb';

export function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocalTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [playlistModalTrack, setPlaylistModalTrack] = useState<LocalTrack | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const { playTrack, addTracks, tracks, playlists, createPlaylist, addToPlaylist } = usePlayerStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    const fetched = await searchAudius(query);
    setResults(fetched);
    setIsSearching(false);
  };

  const handleDownload = async (track: LocalTrack) => {
    if (!track.streamUrl) return;
    setDownloadingId(track.id);
    try {
      const res = await fetch(track.streamUrl);
      const blob = await res.blob();
      const savedTrack = { ...track, file: blob };
      delete savedTrack.streamUrl;
      await saveTrackToDB(savedTrack);
      addTracks([savedTrack]);
    } catch (e) {
      console.error("Download failed", e);
      alert('Failed to download track.');
    }
    setDownloadingId(null);
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
    }
  };

  const isDownloaded = (id: string) => tracks.some(t => t.id === id);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto relative">
      <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-6">Search & Discover</h2>
      
      <form onSubmit={handleSearch} className="mb-8 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs, artists..."
          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
        <button type="submit" className="hidden">Search</button>
      </form>

      {isSearching ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((track) => (
            <div key={track.id} className="flex items-center justify-between p-3 hover:bg-zinc-800/50 rounded-lg group transition-colors">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 bg-zinc-800 rounded overflow-hidden flex-shrink-0 relative">
                  {track.customImageUrl && <img src={track.customImageUrl} alt={track.title} className="w-full h-full object-cover" />}
                  <button 
                    onClick={() => playTrack(track)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Play size={20} className="fill-white text-white ml-1" />
                  </button>
                </div>
                <div className="min-w-0 pr-4">
                  <p className="text-white font-medium truncate">{track.title}</p>
                  <p className="text-zinc-400 text-sm truncate">{track.artist}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <button 
                  onClick={() => setPlaylistModalTrack(track)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full transition-colors"
                  title="Add to Playlist"
                >
                  <Plus size={20} />
                </button>
                
                {isDownloaded(track.id) ? (
                  <div className="p-2 text-indigo-400" title="Downloaded">
                    <Check size={20} />
                  </div>
                ) : (
                  <button 
                    onClick={() => handleDownload(track)}
                    disabled={downloadingId === track.id}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full transition-colors disabled:opacity-50"
                    title="Download & Add to Library"
                  >
                    {downloadingId === track.id ? (
                      <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Download size={20} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Playlist Modal */}
      {playlistModalTrack && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Add to Playlist</h3>
              <button onClick={() => setPlaylistModalTrack(null)} className="text-zinc-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
              {playlists.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-4">No playlists yet.</p>
              ) : (
                playlists.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => {
                      addToPlaylist(p.id, playlistModalTrack.id);
                      setPlaylistModalTrack(null);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-zinc-800 text-white transition-colors flex justify-between items-center"
                  >
                    <span className="truncate">{p.name}</span>
                    {p.trackIds.includes(playlistModalTrack.id) && <Check size={16} className="text-indigo-400 flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="New playlist name..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
                <button 
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
