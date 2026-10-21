import { useSyncExternalStore } from 'react';
import type { TogetherRole, TogetherSession } from '../../types';

/**
 * LOCAL Together Booth session (pass-the-phone). There is no remote sync in Phase 1.
 * No-peeking is enforced here: the hook never exposes photo URIs until `reveal()` succeeds,
 * and `reveal()` refuses unless both participants have submitted `count` photos.
 */
let session: TogetherSession | undefined;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const MIN_PHOTOS = 2;
export const MAX_PHOTOS = 8;

export function startSession(count: number) {
  const n = Math.min(MAX_PHOTOS, Math.max(MIN_PHOTOS, Math.round(count)));
  session = { id: Math.random().toString(36).slice(2, 8).toUpperCase(), count: n, photos: { A: [], B: [] }, revealed: false };
  emit();
}

export function addPhoto(role: TogetherRole, uri: string) {
  if (!session || session.revealed || session.photos[role].length >= session.count) return false;
  session = { ...session, photos: { ...session.photos, [role]: [...session.photos[role], uri] } };
  emit();
  return true;
}

export function reveal() {
  if (!session || session.photos.A.length !== session.count || session.photos.B.length !== session.count) return false;
  session = { ...session, revealed: true };
  emit();
  return true;
}

export function resetSession() {
  session = undefined;
  emit();
}

const snapshot = () => session;
const subscribe = (f: () => void) => (subs.add(f), () => subs.delete(f));

export function useTogether() {
  const s = useSyncExternalStore(subscribe, snapshot);
  return {
    active: !!s,
    id: s?.id,
    count: s?.count ?? 0,
    done: { A: s?.photos.A.length ?? 0, B: s?.photos.B.length ?? 0 },
    revealed: !!s?.revealed,
    // Photos are only returned after a successful reveal.
    album: s?.revealed ? s.photos : undefined,
  };
}
