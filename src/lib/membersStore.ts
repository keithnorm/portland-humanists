/**
 * Storage for members-only data (directory, reading signups, private videos).
 *
 * Uses Netlify Blobs in production. When Blobs isn't configured (plain
 * `astro dev` without `netlify dev`), falls back to JSON files in .data/
 * so the prototype is fully demoable locally.
 *
 * This data must never live in the git repo — the repo is public.
 */
import { getStore } from '@netlify/blobs';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface MemberRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  memberSince?: string;
  interests?: string;
  /** Field names the member has chosen to hide from other members. */
  hidden?: string[];
}

export interface ReadingSignup {
  eventSlug: string;
  userId: string;
  name: string;
  email: string;
  signedUpAt: string;
}

export interface VideoRecord {
  id: string;
  title: string;
  /** Recording date (YYYY-MM-DD). */
  date?: string;
  uploadDate?: string;
  presenter?: string;
  youtubeId?: string;
  vimeoId?: string;
  vimeoHash?: string;
  description?: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  committee: string;
  date?: string;
  text: string;
}

const STORE_NAME = 'members-data';
const LOCAL_DIR = '.data';

// Sample data so the prototype renders something before real data is loaded.
const SEEDS: Record<string, unknown> = {
  directory: [
    { id: 'm1', name: 'Ada Lovelace', email: 'ada@example.org', phone: '503-555-0101', city: 'Portland', memberSince: '2019', interests: 'Mathematics, weaving' },
    { id: 'm2', name: 'Carl Sagan', email: 'carl@example.org', phone: '503-555-0102', city: 'Beaverton', memberSince: '2021', interests: 'Astronomy, science outreach' },
    { id: 'm3', name: 'Zora Neale Hurston', email: 'zora@example.org', city: 'Portland', memberSince: '2020', interests: 'Anthropology, literature' },
  ] satisfies MemberRecord[],
  signups: [] satisfies ReadingSignup[],
  'auth-bridge': [],
  documents: [] satisfies DocumentRecord[],
  videos: [
    { id: 'v1', title: 'Sample Members-Only Recording', date: '2026-06-14', youtubeId: 'lB6kdha6pp4', description: 'Placeholder — replace with an unlisted video. Real entries are stored in Netlify Blobs, not the public repo.' },
  ] satisfies VideoRecord[],
};

// In dev, always use gitignored .data/*.json files — transparent, easy to
// seed (see scripts/), and independent of the adapter's local Blobs
// emulation. Deployed builds always use Netlify Blobs.
const useLocalFiles = import.meta.env.DEV;

async function readLocal<T>(key: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(LOCAL_DIR, `${key}.json`), 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeLocal(key: string, value: unknown): Promise<void> {
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, `${key}.json`), JSON.stringify(value, null, 2));
}

export async function readKey<T>(key: string): Promise<T> {
  if (useLocalFiles) {
    const value = await readLocal<T>(key);
    if (value !== null) return value;
  } else {
    // Strong consistency: the page re-renders immediately after a signup
    // write, and eventually-consistent reads (the default) return stale data.
    const store = getStore({ name: STORE_NAME, consistency: 'strong' });
    const value = await store.get(key, { type: 'json' });
    if (value !== null && value !== undefined) return value as T;
  }
  return structuredClone(SEEDS[key]) as T;
}

export async function writeKey(key: string, value: unknown): Promise<void> {
  if (useLocalFiles) {
    await writeLocal(key, value);
  } else {
    const store = getStore(STORE_NAME);
    await store.setJSON(key, value);
  }
}

export const getDirectory = () => readKey<MemberRecord[]>('directory');
export const setDirectory = (d: MemberRecord[]) => writeKey('directory', d);
export const getSignups = () => readKey<ReadingSignup[]>('signups');
export const setSignups = (s: ReadingSignup[]) => writeKey('signups', s);
export const getVideos = () => readKey<VideoRecord[]>('videos');
export const getDocuments = () => readKey<DocumentRecord[]>('documents');
