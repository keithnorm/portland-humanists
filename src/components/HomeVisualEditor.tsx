import React from 'react';
import { useTina, tinaField } from 'tinacms/dist/react';

import type { HomepageQuery, HomepageQueryVariables } from '../../tina/__generated__/types';
import { attendanceBadges, cleanDescription, initials, videoThumbnail } from '../utils/events';

interface EventItem {
  slug: string;
  data: {
    title: string;
    presenter: string;
    presenterTitle: string;
    presenterImage?: string;
    startTime: Date | string;
    endTime: Date | string;
    location: string;
    speakerRemote?: boolean;
    zoomLink?: string;
    youtubeId?: string;
    vimeoId?: string;
    vimeoThumbnail?: string;
    topics?: string[];
    description: string;
  };
}

interface Props {
  query: string;
  variables: HomepageQueryVariables;
  data: HomepageQuery;
  upcomingEvents: EventItem[];
  recentRecordings: EventItem[];
  archiveCount: number;
  archiveSince: number;
  timezone?: string;
}

const DEFAULT_TZ = 'America/Los_Angeles';

function toDate(v: Date | string): Date {
  return v instanceof Date ? v : new Date(v);
}

function fmt(v: Date | string, opts: Intl.DateTimeFormatOptions, tz?: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz || DEFAULT_TZ, ...opts }).format(toDate(v));
  } catch {
    return '';
  }
}

function timezoneAbbr(v: Date | string, tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(toDate(v))
      .find(p => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

/** Line art cut from the hero drawing; recolored by the theme via CSS mask. */
function Art({ name, className = '' }: { name: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`hgp-art ${className}`}
      style={{ '--art': `url(/art/${name}.png)` } as React.CSSProperties}
    />
  );
}

function DateChip({ date, tz, size = 'md' }: { date: Date | string; tz?: string; size?: 'sm' | 'md' }) {
  const big = size === 'md';
  return (
    <div className={`bg-white rounded-xl shadow-sm text-center leading-none ${big ? 'px-4 py-3 min-w-[4.5rem]' : 'px-2.5 py-2 min-w-[3.25rem]'}`}>
      <div className={`font-semibold uppercase tracking-wide text-[var(--hgp-gold-ink)] ${big ? 'text-xs mb-1' : 'text-[0.65rem] mb-0.5'}`}>
        {fmt(date, { weekday: 'short' }, tz)} · {fmt(date, { month: 'short' }, tz)}
      </div>
      <div className={`font-[family-name:var(--font-display)] font-semibold text-[var(--hgp-primary)] ${big ? 'text-3xl' : 'text-xl'}`}>
        {fmt(date, { day: 'numeric' }, tz)}
      </div>
    </div>
  );
}

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'gold' }) {
  const cls = tone === 'gold'
    ? 'bg-[var(--hgp-gold-soft)] text-[var(--hgp-gold-ink)]'
    : 'bg-[var(--hgp-surface)] text-[var(--hgp-primary)]';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{children}</span>;
}

const Chevron = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const PlayIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
);

// Art for the three value cards, by position — the text stays editable in Tina.
const featureArt = ['telescope', 'discussion', 'torch'];

const expectations = [
  { label: 'Every Sunday', sub: '9:45 – 11:30 AM' },
  { label: 'Free & open to all', sub: 'No membership required' },
  { label: 'In person or on Zoom', sub: 'Friendly House, NW Portland' },
  { label: 'Live music', sub: 'First Sunday of the month' },
  { label: 'Childcare available', sub: 'First Sunday of the month' },
  { label: 'Coffee & conversation', sub: 'After the program' },
];

export function HomeVisualEditor({ query, variables, data, upcomingEvents, recentRecordings, archiveCount, archiveSince, timezone }: Props) {
  const { data: tinaData } = useTina({ query, variables, data });
  const home = tinaData.homepage;
  const tz = timezone || DEFAULT_TZ;

  const next = upcomingEvents[0] ?? null;
  const later = upcomingEvents.slice(1, 4);
  const zoomLink = next?.data.zoomLink || '';
  // The Zoom room opens 30 minutes before the program (see the script in index.astro).
  const zoomOpensAt = next ? new Date(toDate(next.data.startTime).getTime() - 30 * 60 * 1000) : null;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hgp-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[var(--hgp-gold)] mb-5 [text-shadow:none]">
              <span className="w-8 h-px bg-[var(--hgp-gold)]" aria-hidden="true" />
              Sundays at 9:45 · Friendly House &amp; Zoom
            </p>
            <h1
              className="text-4xl md:text-6xl font-semibold mb-6 leading-[1.08]"
              data-tina-field={tinaField(home, 'heroHeading')}
            >
              {home.heroHeading}
            </h1>
            <p
              className="text-xl md:text-2xl text-[var(--hgp-on-primary)] mb-9 leading-relaxed max-w-2xl"
              data-tina-field={tinaField(home, 'heroTagline')}
            >
              {home.heroTagline}
            </p>
            <div className="flex flex-wrap gap-3 [text-shadow:none]">
              <a href="#upcoming-events" className="hgp-btn-gold px-6 py-3 rounded-lg font-semibold transition-colors">
                See Upcoming Programs
              </a>
              <a href="/join" className="border-2 border-white/80 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[var(--hgp-primary)] transition-colors">
                Join Our Community
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Upcoming programs ────────────────────────────────── */}
      <section id="upcoming-events" className="py-16 md:py-20 bg-neutral-50 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--hgp-gold-ink)] mb-2">Every Sunday · Free &amp; open to all</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900">Upcoming Programs</h2>
            </div>
            <a href="/events" className="text-[var(--hgp-primary)] font-semibold inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">
              All upcoming <Chevron />
            </a>
          </div>

          {next ? (
            <article
              id="featured-event-card"
              data-start={toDate(next.data.startTime).toISOString()}
              data-end={toDate(next.data.endTime).toISOString()}
              className="bg-white rounded-2xl shadow-sm ring-1 ring-neutral-200/70 overflow-hidden"
            >
              {/* Live / starting-soon banners — revealed by the script in index.astro */}
              <div id="live-banner-live" style={{ display: 'none' }}
                className="bg-red-600 text-white px-6 py-2.5 flex items-center justify-between text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse inline-block" />
                  Happening now
                </span>
                {zoomLink && <a href={zoomLink} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Join via Zoom →</a>}
              </div>
              <div id="live-banner-soon" style={{ display: 'none' }}
                className="bg-[var(--hgp-gold)] text-[var(--hgp-primary)] px-6 py-2.5 flex items-center justify-between text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[var(--hgp-primary)] rounded-full animate-pulse inline-block" />
                  <span id="live-banner-soon-text">Starting soon</span>
                </span>
                {zoomLink && <a href={zoomLink} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Join via Zoom →</a>}
              </div>

              <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                {/* Visual: speaker photo when there is one, otherwise line art */}
                <div className="relative bg-[var(--hgp-surface)] min-h-[13rem] md:min-h-full">
                  {next.data.presenterImage ? (
                    <img src={next.data.presenterImage} alt={next.data.presenter} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <Art name="lecture" className="absolute inset-6 md:inset-10 opacity-80" />
                  )}
                  <div className="absolute top-4 left-4">
                    <DateChip date={next.data.startTime} tz={tz} />
                  </div>
                </div>

                <div className="p-6 md:p-8 lg:p-10">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {attendanceBadges(next.data.location, next.data.speakerRemote).map(b => (
                      <Badge key={b.label} tone={b.kind === 'in-person' ? 'gold' : 'neutral'}>{b.label}</Badge>
                    ))}
                  </div>
                  <a href={`/events/${next.slug}`} className="group">
                    <h3 className="text-2xl md:text-3xl font-semibold text-neutral-900 leading-snug mb-4 group-hover:text-[var(--hgp-primary)] transition-colors">
                      {next.data.title}
                    </h3>
                  </a>
                  <div className="flex items-center gap-3 mb-5">
                    {!next.data.presenterImage && (
                      <div className="w-10 h-10 rounded-full bg-[var(--hgp-primary)] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0" aria-hidden="true">
                        {initials(next.data.presenter)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-neutral-900">{next.data.presenter}</div>
                      {next.data.presenterTitle && <div className="text-sm text-neutral-600 line-clamp-1">{next.data.presenterTitle}</div>}
                    </div>
                  </div>
                  <p className="text-neutral-600 leading-relaxed line-clamp-3 mb-2">{cleanDescription(next.data.description)}</p>
                  <p className="text-sm text-neutral-500 mb-6">
                    {fmt(next.data.startTime, { hour: 'numeric', minute: '2-digit' }, tz)} – {fmt(next.data.endTime, { hour: 'numeric', minute: '2-digit' }, tz)} {timezoneAbbr(next.data.endTime, tz)}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    {zoomLink ? (
                      <>
                        {/* Waiting state: tells people when the link works instead of a dead button */}
                        <span id="featured-zoom-wait" className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Zoom opens {zoomOpensAt ? `${fmt(zoomOpensAt, { weekday: 'short' }, tz)} at ${fmt(zoomOpensAt, { hour: 'numeric', minute: '2-digit' }, tz)}` : 'before the program'}
                        </span>
                        <a
                          id="featured-zoom-btn"
                          href={zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'none' }}
                          className="inline-flex items-center gap-2 bg-[var(--hgp-primary)] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[var(--hgp-mid)] transition-colors"
                        >
                          Join via Zoom
                        </a>
                      </>
                    ) : (
                      <span className="text-sm text-neutral-500">Zoom link will be posted closer to the date</span>
                    )}
                    <a href={`/events/${next.slug}`} className="inline-flex items-center gap-1.5 px-2 py-2.5 text-[var(--hgp-primary)] font-semibold hover:gap-2.5 transition-all">
                      Program details <Chevron />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ) : (
            <div className="bg-white rounded-2xl ring-1 ring-neutral-200/70 p-12 text-center">
              <p className="text-neutral-600 text-lg">No upcoming programs are scheduled yet. Check back soon!</p>
            </div>
          )}

          {/* Following weeks */}
          {later.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3 font-[family-name:var(--font-sans)]">Also coming up</h3>
              <div className="grid gap-3 md:grid-cols-3">
                {later.map(event => (
                  <a
                    key={event.slug}
                    href={`/events/${event.slug}`}
                    className="group bg-white rounded-xl ring-1 ring-neutral-200/70 p-4 flex gap-4 items-center hover:ring-[var(--hgp-primary)]/40 hover:shadow-sm transition"
                  >
                    <DateChip date={event.data.startTime} tz={tz} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-neutral-900 leading-snug line-clamp-2 group-hover:text-[var(--hgp-primary)] transition-colors">{event.data.title}</div>
                      <div className="text-sm text-neutral-500 truncate mt-0.5">{event.data.presenter}</div>
                    </div>
                    <Chevron className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* What to expect */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
            {expectations.map(item => (
              <div key={item.label} className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--hgp-gold)] flex-shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-sm md:text-base font-semibold text-neutral-900">{item.label}</div>
                  <div className="text-sm text-neutral-500">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What is Humanism ─────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:transition-[top] lg:duration-300">
              <h2
                className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-6"
                data-tina-field={tinaField(home, 'humanismHeading')}
              >
                {home.humanismHeading}
              </h2>
              <p className="text-lg text-neutral-700 leading-relaxed mb-5" data-tina-field={tinaField(home, 'humanismBody1')}>
                {home.humanismBody1}
              </p>
              <p className="text-lg text-neutral-700 leading-relaxed mb-8" data-tina-field={tinaField(home, 'humanismBody2')}>
                {home.humanismBody2}
              </p>
              <a href="/humanism" className="inline-flex items-center gap-1.5 text-[var(--hgp-primary)] font-semibold hover:gap-2.5 transition-all">
                More about humanism <Chevron />
              </a>
            </div>

            {home.features && home.features.length > 0 && (
              <div className="space-y-4">
                {home.features.map((feature, i) => feature && (
                  <div key={i} className="grid grid-cols-[6rem_minmax(0,1fr)] sm:grid-cols-[9rem_minmax(0,1fr)] gap-5 items-center rounded-2xl bg-[var(--hgp-surface-alt)] ring-1 ring-neutral-200/60 p-4 sm:p-5">
                    <Art name={featureArt[i % featureArt.length]} className="aspect-[4/3] w-full" />
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-1.5" data-tina-field={tinaField(feature, 'title')}>
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600 leading-relaxed" data-tina-field={tinaField(feature, 'description')}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Recent recordings ────────────────────────────────── */}
      {recentRecordings.length > 0 && (
        <section className="py-16 md:py-20 bg-neutral-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[var(--hgp-gold-ink)] mb-2">
                  {archiveCount}+ talks since {archiveSince}
                </p>
                <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900">Watch Recent Programs</h2>
              </div>
              <a href="/events/past" className="text-[var(--hgp-primary)] font-semibold inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Browse the archive <Chevron />
              </a>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRecordings.map(event => {
                const thumb = videoThumbnail(event.data);
                return (
                  <a key={event.slug} href={`/events/${event.slug}`} className="group bg-white rounded-xl overflow-hidden ring-1 ring-neutral-200/70 hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-[var(--hgp-primary)] relative overflow-hidden">
                      {thumb && <img src={thumb} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />}
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 text-white text-xs font-semibold px-3 py-1.5">
                        <PlayIcon className="w-3.5 h-3.5" /> Watch
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="text-sm text-neutral-500 mb-1.5">{fmt(event.data.startTime, { month: 'long', day: 'numeric', year: 'numeric' }, tz)}</div>
                      <h3 className="text-lg font-semibold text-neutral-900 leading-snug mb-1.5 group-hover:text-[var(--hgp-primary)] transition-colors">{event.data.title}</h3>
                      <p className="text-neutral-600 text-sm">{event.data.presenter}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Get involved ─────────────────────────────────────── */}
      {home.involvement && home.involvement.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-8"
              data-tina-field={tinaField(home, 'involvementHeading')}
            >
              {home.involvementHeading || 'More Ways to Get Involved'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {home.involvement.map((item, i) => item && (
                <a
                  key={i}
                  href={item.link}
                  className="group flex flex-col rounded-2xl ring-1 ring-neutral-200/70 p-6 border-t-4 border-[var(--hgp-gold)] hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2" data-tina-field={tinaField(item, 'title')}>{item.title}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed flex-1 mb-4" data-tina-field={tinaField(item, 'description')}>{item.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--hgp-primary)] group-hover:gap-2.5 transition-all">
                    {item.linkText || 'Learn more'} <Chevron />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Join CTA ─────────────────────────────────────────── */}
      <section className="hgp-cta text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 grid md:grid-cols-[minmax(0,1fr)_14rem] gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4" data-tina-field={tinaField(home, 'ctaHeading')}>
              {home.ctaHeading}
            </h2>
            <p className="text-lg md:text-xl text-[var(--hgp-on-primary)] mb-8 max-w-2xl leading-relaxed" data-tina-field={tinaField(home, 'ctaBody')}>
              {home.ctaBody}
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/join" className="hgp-btn-gold inline-block px-7 py-3.5 rounded-lg font-semibold transition-colors">
                Become a Member
              </a>
              <a href="/contribute" className="inline-block border-2 border-white/70 px-7 py-3.5 rounded-lg font-semibold hover:bg-white hover:text-[var(--hgp-primary)] transition-colors">
                Make a Donation
              </a>
            </div>
          </div>
          <Art name="compass" className="hidden md:block aspect-square w-full !bg-[var(--hgp-on-primary)] opacity-60" />
        </div>
      </section>
    </>
  );
}
