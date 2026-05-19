import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { LocalTrack, Playlist } from '../store/usePlayerStore';

// We strip out any file blobs before sending to Firebase
const cleanTracksForFirebase = (tracks: LocalTrack[]) => {
  return tracks.map(t => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    duration: t.duration,
    customImageUrl: t.customImageUrl || null,
    isVideo: t.isVideo || false,
    streamUrl: t.streamUrl || null,
    source: t.source || 'local'
  }));
};

export const syncLibraryToFirebase = async (tracks: LocalTrack[]) => {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  
  try {
    const cleaned = cleanTracksForFirebase(tracks);
    const syncable = cleaned.filter(t => t.streamUrl);
    
    // Using trackMetadata collection per rules
    for (const track of syncable) {
      await setDoc(doc(db, 'trackMetadata', track.id), {
        userId: uid,
        fileHash: track.id,
        title: track.title,
        artist: track.artist || '',
        customImage: track.customImageUrl || '',
        duration: track.duration || 0,
        source: track.source || 'local',
        streamUrl: track.source === 'youtube' ? null : track.streamUrl, // Don't store absolute youtube proxy URLs if possible, reconstruct later
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
    console.log("Synced library items to Firebase trackMetadata!");
  } catch (err) {
    console.error("Failed to sync to firebase", err);
  }
};

export const syncSettingsToFirebase = async (settings: { background: string, backgroundOpacity: number, blurBackground: boolean }) => {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  try {
    await setDoc(doc(db, 'userSettings', uid), {
      userId: uid,
      background: settings.background,
      backgroundOpacity: settings.backgroundOpacity,
      blurBackground: settings.blurBackground,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log("Synced settings to Firebase!");
  } catch (err) {
    console.error("Failed to sync settings", err);
  }
};

export const loadSettingsFromFirebase = async () => {
  if (!auth.currentUser) return null;
  const uid = auth.currentUser.uid;
  try {
    const snap = await getDoc(doc(db, 'userSettings', uid));
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.error("Failed to load settings from firebase", err);
  }
  return null;
};

export const syncPlaylistsToFirebase = async (playlists: Playlist[]) => {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  try {
    // We store all playlists in a single doc for simplicity, or use separate docs
    // Let's use separate docs in the 'playlists' collection
    for (const p of playlists) {
      await setDoc(doc(db, 'playlists', p.id), {
        userId: uid,
        name: p.name,
        trackIds: p.trackIds,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
    console.log("Synced playlists to Firebase!");
  } catch (err) {
    console.error("Failed to sync playlists", err);
  }
};

export const loadPlaylistsFromFirebase = async (): Promise<Playlist[]> => {
  if (!auth.currentUser) return [];
  const uid = auth.currentUser.uid;
  try {
    const q = query(collection(db, 'playlists'), where('userId', '==', uid));
    const snap = await getDocs(q);
    const fetched: Playlist[] = [];
    snap.forEach(d => {
      const data = d.data();
      fetched.push({
        id: d.id,
        name: data.name,
        trackIds: data.trackIds || []
      });
    });
    return fetched;
  } catch (err) {
    console.error("Failed to load playlists", err);
    return [];
  }
};

export const loadLibraryFromFirebase = async (): Promise<LocalTrack[]> => {
  if (!auth.currentUser) return [];
  const uid = auth.currentUser.uid;
  try {
    const q = query(collection(db, 'trackMetadata'), where('userId', '==', uid));
    const snap = await getDocs(q);
    const fetchedTracks: LocalTrack[] = [];
    
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const source = data.source || 'youtube';
      let streamUrl = data.streamUrl;
      
      if (source === 'youtube') {
        const baseUrl = window.location.origin.includes('localhost') || window.location.protocol === 'capacitor:' 
          ? 'https://ais-pre-tn4pxmdr4icvzdpqtd7ohb-550584511807.asia-southeast1.run.app' 
          : window.location.origin;
        streamUrl = `${baseUrl}/api/yt-audio?v=${data.fileHash}`;
      }

      fetchedTracks.push({
        id: data.fileHash,
        title: data.title,
        artist: data.artist,
        duration: data.duration,
        customImageUrl: data.customImage || undefined,
        isVideo: false,
        source: source as any,
        streamUrl: streamUrl
      });
    });
    return fetchedTracks;
  } catch (err) {
    console.error("Failed to load from firebase", err);
  }
  return [];
};
