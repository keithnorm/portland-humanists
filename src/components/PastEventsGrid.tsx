import { useState, useMemo, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import {
  RECORDING_PENDING_DAYS,
  cleanDescription,
  hasVideo,
  videoEmbedUrl,
  videoPageUrl,
  videoThumbnail,
} from '../utils/events';

const BATCH = 12;
const ART = ['lecture', 'telescope', 'discussion', 'compass', 'torch'];

export type PastEventItem = {
  /** Omit for items with no event detail page (e.g. archive videos). */
  slug?: string;
  title: string;
  startTime: Date | string;
  presenter?: string;
  description?: string;
  youtubeId?: string;
  vimeoId?: string;
  vimeoHash?: string;
  vimeoThumbnail?: string;
  topics?: string[];
  featured?: boolean;
  /** Recording is shared only with members, so never "coming soon" publicly. */
  membersOnly?: boolean;
  /** Small label rendered on the thumbnail (e.g. "Members only"). */
  badge?: string;
  /** Kept for compatibility: every video now plays in the on-page player,
      which private Vimeo videos require anyway. */
  embed?: boolean;
};

function parseDate(startTime: Date | string): Date {
  if (startTime instanceof Date) return startTime;
  const normalized = startTime.replace(' ', 'T').replace(/T(\d):/, 'T0$1:');
  return new Date(normalized);
}

function formatDate(startTime: Date | string): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(parseDate(startTime));
}

function hashIndex(s: string, n: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % n;
}

const PlayIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
);

/** Thumbnail, or a designed stand-in so cards without video still line up. */
function Thumbnail({ event, onPlay }: { event: PastEventItem; onPlay: () => void }) {
  const thumb = videoThumbnail(event);
  const video = hasVideo(event);
  const ageDays = (Date.now() - parseDate(event.startTime).getTime()) / 86_400_000;
  // Recent programs without a video are usually still being edited, unless
  // the recording is members-only. Older ones without a public video are
  // assumed to be members-only too.
  const pending = !video && !event.membersOnly && ageDays < RECORDING_PENDING_DAYS;

  const inner = (
    <>
      {thumb ? (
        <img src={thumb} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
      ) : (
        <div className="absolute inset-0 bg-[var(--hgp-surface)]">
          <div
            aria-hidden="true"
            className="hgp-art absolute inset-4 opacity-50"
            style={{ '--art': `url(/art/${ART[hashIndex(event.title, ART.length)]}.png)` } as CSSProperties}
          />
        </div>
      )}
      {video ? (
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 text-white text-xs font-semibold px-3 py-1.5">
          <PlayIcon className="w-3.5 h-3.5" /> Watch
        </span>
      ) : (
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 text-neutral-700 text-xs font-semibold px-3 py-1.5 ring-1 ring-neutral-200">
          {pending ? 'Recording coming soon' : 'Members only'}
        </span>
      )}
      {event.badge && (
        <span className="absolute top-3 right-3 bg-neutral-900/80 text-white text-xs font-semibold px-2 py-1 rounded">{event.badge}</span>
      )}
    </>
  );

  const cls = 'group relative block w-full aspect-video overflow-hidden bg-neutral-200';
  if (video) {
    return (
      <button type="button" onClick={onPlay} className={`${cls} cursor-pointer`} aria-label={`Play recording: ${event.title}`}>
        {inner}
      </button>
    );
  }
  return event.slug ? <a href={`/events/${event.slug}`} className={cls} tabIndex={-1} aria-hidden="true">{inner}</a> : <div className={cls}>{inner}</div>;
}

function EventCard({ event, onPlay, onTopic }: { event: PastEventItem; onPlay: () => void; onTopic: (t: string) => void }) {
  return (
    <article className="flex flex-col bg-white rounded-xl overflow-hidden ring-1 ring-neutral-200/70 hover:shadow-md transition-shadow">
      <Thumbnail event={event} onPlay={onPlay} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-sm">
          <span className="text-neutral-500">{formatDate(event.startTime)}</span>
          {event.topics?.slice(0, 1).map(t => (
            <button key={t} type="button" onClick={() => onTopic(t)} className="text-[var(--hgp-gold-ink)] font-semibold hover:underline">
              {t}
            </button>
          ))}
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 leading-snug mb-1.5 line-clamp-2">
          {event.slug ? (
            <a href={`/events/${event.slug}`} className="hover:text-[var(--hgp-primary)] transition-colors">{event.title}</a>
          ) : event.title}
        </h3>
        {event.presenter && <p className="text-sm text-neutral-600 line-clamp-1">{event.presenter}</p>}
      </div>
    </article>
  );
}

function VideoModal({ event, onClose }: { event: PastEventItem; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const embed = videoEmbedUrl(event);
  const external = videoPageUrl(event);
  const description = cleanDescription(event.description);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true" aria-label={event.title}>
      <div className="absolute inset-0 bg-neutral-950/85" onClick={onClose} />
      <div className="relative w-full max-w-5xl pt-12">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute top-0 right-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-white/15 text-white text-sm font-semibold hover:bg-white/25"
          aria-label="Close video"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          Close
        </button>
        <div className="max-h-[calc(100vh-7rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {embed && (
          <iframe
            src={embed}
            title={event.title}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            className="block w-full aspect-video bg-black"
          />
        )}
        <div className="p-5 sm:p-7">
          <div className="text-sm text-neutral-500 mb-1">{formatDate(event.startTime)}{event.presenter ? ` · ${event.presenter}` : ''}</div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-3">{event.title}</h2>
          {description && <p className="text-neutral-600 leading-relaxed line-clamp-4 mb-4">{description}</p>}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
            {event.slug && <a href={`/events/${event.slug}`} className="text-[var(--hgp-primary)] hover:underline">Program details →</a>}
            {external && !event.vimeoHash && (
              <a href={external} target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:underline">
                Open on {event.youtubeId ? 'YouTube' : 'Vimeo'} ↗
              </a>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function PastEventsGrid({ events }: { events: PastEventItem[] }) {
  const [query, setQuery] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [videoOnly, setVideoOnly] = useState(false);
  const [shown, setShown] = useState(BATCH);
  const [playing, setPlaying] = useState<PastEventItem | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const closeModal = useCallback(() => setPlaying(null), []);

  const years = useMemo(
    () => Array.from(new Set(events.map(e => parseDate(e.startTime).getFullYear()))).sort((a, b) => b - a),
    [events],
  );

  const topicCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of events) for (const t of e.topics ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [events]);

  const featured = useMemo(() => events.filter(e => e.featured && hasVideo(e)).slice(0, 3), [events]);

  const filtered = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return events.filter(e => {
      if (year !== null && parseDate(e.startTime).getFullYear() !== year) return false;
      if (topic !== null && !(e.topics ?? []).includes(topic)) return false;
      if (videoOnly && !hasVideo(e)) return false;
      if (words.length) {
        const hay = `${e.title} ${e.presenter ?? ''} ${e.description ?? ''} ${(e.topics ?? []).join(' ')}`.toLowerCase();
        return words.every(w => hay.includes(w));
      }
      return true;
    });
  }, [events, query, year, topic, videoOnly]);

  const isFiltered = query.trim() !== '' || year !== null || topic !== null || videoOnly;

  // Deep links from program pages: /events/past?topic=Science
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('topic');
    if (t && topicCounts.some(([name]) => name === t)) setTopic(t);
  }, [topicCounts]);

  // Reset the visible batch whenever the filters change
  useEffect(() => { setShown(BATCH); }, [query, year, topic, videoOnly]);

  function pickTopic(t: string | null) {
    setTopic(prev => (prev === t ? null : t));
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function clearAll() {
    setQuery(''); setYear(null); setTopic(null); setVideoOnly(false);
  }

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${active
      ? 'bg-[var(--hgp-primary)] text-white'
      : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-[var(--hgp-primary)]/40'}`;

  return (
    <div>
      {/* Featured recordings — editors tick "Featured recording" on a program in Tina */}
      {featured.length > 0 && !isFiltered && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-5">Featured</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map(e => <EventCard key={`f-${e.slug ?? e.title}`} event={e} onPlay={() => setPlaying(e)} onTopic={pickTopic} />)}
          </div>
        </section>
      )}

      <div ref={topRef} className="scroll-mt-40" />

      {/* Search + filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search talks, speakers, or topics…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search past programs"
              className="w-full pl-11 pr-4 py-3 bg-white ring-1 ring-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--hgp-primary)]"
            />
          </div>
          <select
            value={year ?? ''}
            onChange={e => setYear(e.target.value ? Number(e.target.value) : null)}
            aria-label="Filter by year"
            className="py-3 pl-3 pr-9 bg-white ring-1 ring-neutral-300 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[var(--hgp-primary)]"
          >
            <option value="">Any year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <label className="inline-flex items-center gap-2 px-1 text-sm text-neutral-700 whitespace-nowrap cursor-pointer">
            <input type="checkbox" checked={videoOnly} onChange={e => setVideoOnly(e.target.checked)} className="w-4 h-4 accent-[var(--hgp-primary)]" />
            With video
          </label>
        </div>

        {topicCounts.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
            <button type="button" onClick={() => setTopic(null)} className={chip(topic === null)}>All topics</button>
            {topicCounts.map(([t, n]) => (
              <button key={t} type="button" onClick={() => pickTopic(t)} className={chip(topic === t)}>
                {t} <span className={topic === t ? 'text-white/70' : 'text-neutral-400'}>{n}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <p className="text-neutral-500">
            {filtered.length === 0 ? 'No programs found' : `${filtered.length} program${filtered.length === 1 ? '' : 's'}`}
          </p>
          {isFiltered && (
            <button type="button" onClick={clearAll} className="text-[var(--hgp-primary)] hover:underline font-medium">Clear filters</button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl ring-1 ring-neutral-200/70 p-12 text-center">
          <p className="text-neutral-600">
            No programs match. <button type="button" onClick={clearAll} className="text-[var(--hgp-primary)] font-medium hover:underline">Clear filters</button>
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, shown).map(e => (
            <EventCard key={e.slug ?? `${e.title}-${String(e.startTime)}`} event={e} onPlay={() => setPlaying(e)} onTopic={pickTopic} />
          ))}
        </div>
      )}

      {shown < filtered.length && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setShown(s => s + BATCH)}
            className="px-6 py-3 rounded-lg bg-white ring-1 ring-neutral-300 font-semibold text-[var(--hgp-primary)] hover:ring-[var(--hgp-primary)] transition"
          >
            Show more programs
          </button>
          <span className="text-sm text-neutral-500">Showing {Math.min(shown, filtered.length)} of {filtered.length}</span>
        </div>
      )}

      {playing && <VideoModal event={playing} onClose={closeModal} />}
    </div>
  );
}
