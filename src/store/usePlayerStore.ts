import { create } from 'zustand';
import { getAllSavedTracks } from '../lib/idb';

export interface LocalTrack {
  id: string; // fileHash or audius id
  file?: File | Blob;
  streamUrl?: string;
  title: string;
  artist: string;
  duration: number;
  customImageUrl?: string;
  isVideo: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
}

interface PlayerState {
  tracks: LocalTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  queue: LocalTrack[];
  isShuffle: boolean;
  isRepeat: boolean;
  playlists: Playlist[];
  isExpanded: boolean;
  progress: number;
  duration: number;
  isBuffering: boolean;
  
  setTracks: (tracks: LocalTrack[]) => void;
  addTracks: (tracks: LocalTrack[]) => void;
  setCurrentTrackIndex: (index: number) => void;
  playTrack: (track: LocalTrack) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setIsExpanded: (isExpanded: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setIsBuffering: (isBuffering: boolean) => void;
  seekTo: number | null;
  setSeekTo: (time: number | null) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  updateTrackImage: (id: string, imageUrl: string) => void;
  
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  loadSavedData: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  tracks: [],
  currentTrackIndex: -1,
  isPlaying: false,
  volume: 1,
  queue: [],
  isShuffle: false,
  isRepeat: false,
  playlists: [],
  isExpanded: false,
  progress: 0,
  duration: 0,
  isBuffering: false,

  setTracks: (tracks) => set({ tracks, queue: tracks }),
  addTracks: (newTracks) => set((state) => {
    const existingIds = new Set(state.tracks.map(t => t.id));
    const uniqueNew = newTracks.filter(t => !existingIds.has(t.id));
    const combined = [...state.tracks, ...uniqueNew];
    return { tracks: combined, queue: combined };
  }),
  setCurrentTrackIndex: (index) => set({ currentTrackIndex: index, isPlaying: true }),
  playTrack: (track) => set((state) => {
    const existingIndex = state.queue.findIndex(t => t.id === track.id);
    if (existingIndex >= 0) {
      return { currentTrackIndex: existingIndex, isPlaying: true };
    } else {
      const newQueue = [track, ...state.queue];
      return { queue: newQueue, currentTrackIndex: 0, isPlaying: true };
    }
  }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),
  setIsExpanded: (isExpanded) => set({ isExpanded }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setIsBuffering: (isBuffering) => set({ isBuffering }),
  seekTo: null,
  setSeekTo: (time) => set({ seekTo: time }),
  
  nextTrack: () => set((state) => {
    if (state.queue.length === 0) return state;
    let nextIndex = state.currentTrackIndex + 1;
    if (nextIndex >= state.queue.length) {
      nextIndex = state.isRepeat ? 0 : state.currentTrackIndex;
    }
    if (state.isShuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    }
    return { currentTrackIndex: nextIndex, isPlaying: true };
  }),
  
  prevTrack: () => set((state) => {
    if (state.queue.length === 0) return state;
    let prevIndex = state.currentTrackIndex - 1;
    if (prevIndex < 0) {
      prevIndex = state.isRepeat ? state.queue.length - 1 : 0;
    }
    return { currentTrackIndex: prevIndex, isPlaying: true };
  }),

  updateTrackImage: (id, imageUrl) => set((state) => ({
    tracks: state.tracks.map(t => t.id === id ? { ...t, customImageUrl: imageUrl } : t),
    queue: state.queue.map(t => t.id === id ? { ...t, customImageUrl: imageUrl } : t)
  })),

  createPlaylist: (name) => set((state) => ({
    playlists: [...state.playlists, { id: Date.now().toString(), name, trackIds: [] }]
  })),

  addToPlaylist: (playlistId, trackId) => set((state) => ({
    playlists: state.playlists.map(p => 
      p.id === playlistId && !p.trackIds.includes(trackId)
        ? { ...p, trackIds: [...p.trackIds, trackId] }
        : p
    )
  })),

  loadSavedData: async () => {
    try {
      const savedTracks = await getAllSavedTracks();
      if (savedTracks && savedTracks.length > 0) {
        get().addTracks(savedTracks);
      }
    } catch (e) {
      console.error("Failed to load saved tracks", e);
    }
  }
}));
