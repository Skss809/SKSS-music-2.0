import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MusicDB extends DBSchema {
  trackImages: {
    key: string; // fileHash
    value: {
      fileHash: string;
      imageBlob: Blob;
    };
  };
  savedTracks: {
    key: string;
    value: {
      id: string;
      file: Blob;
      title: string;
      artist: string;
      duration: number;
      customImageUrl?: string;
      isVideo: boolean;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<MusicDB>> | null = null;

export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MusicDB>('skss-music-db', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('trackImages', { keyPath: 'fileHash' });
        }
        if (oldVersion < 2) {
          db.createObjectStore('savedTracks', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveTrackImage(fileHash: string, imageBlob: Blob) {
  const db = await getDB();
  await db.put('trackImages', { fileHash, imageBlob });
}

export async function getTrackImage(fileHash: string): Promise<Blob | undefined> {
  const db = await getDB();
  const record = await db.get('trackImages', fileHash);
  return record?.imageBlob;
}

export async function saveTrackToDB(track: any) {
  const db = await getDB();
  await db.put('savedTracks', track);
}

export async function getAllSavedTracks() {
  const db = await getDB();
  return await db.getAll('savedTracks');
}
