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
  city?: string;
  memberSince?: string;
  interests?: string;
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
  date: string;
  youtubeId: string;
  description?: string;
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
  videos: [
    { id: 'v1', title: 'Sample Members-Only Recording', date: '2026-06-14', youtubeId: 'lB6kdha6pp4', description: 'Placeholder — replace with an unlisted video. Real entries are stored in Netlify Blobs, not the public repo.' },
  ] satisfies VideoRecord[],
};

function blobsAvailable(): boolean {
  return Boolean(
    process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT ||
    (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_TOKEN)
  );
}

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
  if (blobsAvailable()) {
    const store = getStore(STORE_NAME);
    const value = await store.get(key, { type: 'json' });
    if (value !== null && value !== undefined) return value as T;
  } else {
    const value = await readLocal<T>(key);
    if (value !== null) return value;
  }
  return SEEDS[key] as T;
}

export async function writeKey(key: string, value: unknown): Promise<void> {
  if (blobsAvailable()) {
    const store = getStore(STORE_NAME);
    await store.setJSON(key, value);
  } else {
    await writeLocal(key, value);
  }
}

export const getDirectory = () => readKey<MemberRecord[]>('directory');
export const getSignups = () => readKey<ReadingSignup[]>('signups');
export const setSignups = (s: ReadingSignup[]) => writeKey('signups', s);
export const getVideos = () => readKey<VideoRecord[]>('videos');
