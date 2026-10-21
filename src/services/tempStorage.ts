import { Directory, File, Paths } from 'expo-file-system';

/**
 * Official-photo storage contract. Phase 1 = device cache only (never uploaded, never in a DB).
 * A later phase can add a permanent implementation and swap `officialStorage` without touching screens.
 */
export interface OfficialPhotoStorage {
  /** Copies a file into app-managed temporary storage and returns its new URI. */
  saveTemp(sourceUri: string): Promise<string>;
  /** Deletes one temporary file; missing files are ignored. */
  remove(uri: string): Promise<void>;
  /** Deletes every temporary official photo. */
  clearAll(): Promise<void>;
}

const dir = () => new Directory(Paths.cache, 'official');

export const cacheOfficialStorage: OfficialPhotoStorage = {
  async saveTemp(sourceUri) {
    const d = dir();
    if (!d.exists) d.create({ intermediates: true, idempotent: true });
    const dest = new File(d, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`);
    new File(sourceUri).copy(dest);
    return dest.uri;
  },
  async remove(uri) {
    try {
      const f = new File(uri);
      if (f.exists) f.delete();
    } catch {
      // already gone; cache is cleaned by the OS anyway
    }
  },
  async clearAll() {
    try {
      const d = dir();
      if (d.exists) d.delete();
    } catch {
      // best effort
    }
  },
};

export const officialStorage: OfficialPhotoStorage = cacheOfficialStorage;
