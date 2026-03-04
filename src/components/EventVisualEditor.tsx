import React from 'react';
import { useTina, tinaField } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import type { TinaMarkdownContent } from 'tinacms/dist/rich-text';
import type { EventsQuery, EventsQueryVariables } from '../../tina/__generated__/types';

interface Props {
  query: string;
  variables: EventsQueryVariables;
  data: EventsQuery;
  defaultZoomLink?: string;
}

const MAPS_URL = 'https://maps.google.com/?q=Friendly+House+Community+Center+1737+NW+26th+Ave+Portland+OR+97210';

function LocationText({ location, zoomLink }: { location: string; zoomLink?: string | null }) {
  const lower = location.toLowerCase();
  const hasFH = lower.includes('friendly house');
  const hasZoom = lower.includes('zoom');

  if (!hasFH && !hasZoom) return <>{location}</>;

  const parts: React.ReactNode[] = [];
  let remaining = location;

  const fhIdx = remaining.toLowerCase().indexOf('friendly house');
  if (fhIdx !== -1) {
    if (fhIdx > 0) parts.push(remaining.slice(0, fhIdx));
    parts.push(
      <a key="fh" href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">
        {remaining.slice(fhIdx, fhIdx + 'friendly house'.length)}
      </a>
    );
    remaining = remaining.slice(fhIdx + 'friendly house'.length);
  }

  const zoomIdx = remaining.toLowerCase().indexOf('zoom');
  if (zoomIdx !== -1) {
    if (zoomIdx > 0) parts.push(remaining.slice(0, zoomIdx));
    const zoomText = remaining.slice(zoomIdx, zoomIdx + 4);
    parts.push(zoomLink
      ? <a key="zoom" href={zoomLink} target="_blank" rel="noopener noreferrer" className="hover:underline">{zoomText}</a>
      : zoomText
    );
    remaining = remaining.slice(zoomIdx + 4);
  }

  if (remaining) parts.push(remaining);
  return <>{parts}</>;
}

function parseStartTime(startTime: string): Date | null {
  try {
    const date = new Date(startTime.replace(' ', 'T'));
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function formatTime(timeString: string): string | null {
  try {
    const parts = timeString.split(' ');
    if (parts.length < 2) return null;
    const [hours, minutes] = parts[1].split(':');
    const hour = parseInt(hours);
    if (isNaN(hour) || !minutes) return null;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return null;
  }
}

export function EventVisualEditor({ query, variables, data, defaultZoomLink = '' }: Props) {
  const { data: tinaData } = useTina({ query, variables, data });
  const event = tinaData.events;

  const eventDate = event.startTime ? parseStartTime(event.startTime) : null;
  const isUpcoming = event.endTime ? new Date(event.endTime.replace(' ', 'T')) > new Date() : false;
  const effectiveZoomLink = event.zoomLink || defaultZoomLink || '';

  return (
    <>
      {/* Hero */}
      <section className="hgp-cta text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/events" className="inline-flex items-center gap-2 text-[var(--hgp-on-primary)] hover:text-white mb-6 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </a>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            data-tina-field={tinaField(event, 'title')}
          >
            {event.title}
          </h1>
          {eventDate && (
            <p className="text-xl text-[var(--hgp-on-primary)]">{formatDate(eventDate)}</p>
          )}
        </div>
      </section>

      {/* Event Details */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-neutral-50 rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Event Details</h2>
                <div className="space-y-4">
                  {eventDate && (
                    <div>
                      <div className="flex items-center gap-2 text-neutral-600 mb-1">
                        <svg className="w-5 h-5 text-[var(--hgp-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Date</span>
                      </div>
                      <p className="text-neutral-900 ml-7">{formatDate(eventDate)}</p>
                    </div>
                  )}

                  {event.startTime && event.endTime && formatTime(event.startTime) && formatTime(event.endTime) && (
                    <div>
                      <div className="flex items-center gap-2 text-neutral-600 mb-1">
                        <svg className="w-5 h-5 text-[var(--hgp-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Time</span>
                      </div>
                      <p className="text-neutral-900 ml-7" data-tina-field={tinaField(event, 'startTime')}>
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </p>
                    </div>
                  )}

                  {event.location && (
                    <div>
                      <div className="flex items-center gap-2 text-neutral-600 mb-1">
                        <svg className="w-5 h-5 text-[var(--hgp-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Location</span>
                      </div>
                      <p className="text-neutral-900 ml-7" data-tina-field={tinaField(event, 'location')}>
                        <LocationText location={event.location} zoomLink={effectiveZoomLink} />
                      </p>
                      {(event as any).speakerRemote && (
                        <p className="ml-7 mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Speaker presenting remotely
                        </p>
                      )}
                    </div>
                  )}

                  {event.presenter && (
                    <div>
                      <div className="flex items-center gap-2 text-neutral-600 mb-1">
                        <svg className="w-5 h-5 text-[var(--hgp-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">Presenter</span>
                      </div>
                      <p className="text-neutral-900 ml-7 font-semibold" data-tina-field={tinaField(event, 'presenter')}>
                        {event.presenter}
                      </p>
                      {event.presenterTitle && (
                        <p className="text-neutral-600 ml-7 text-sm" data-tina-field={tinaField(event, 'presenterTitle')}>
                          {event.presenterTitle}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {effectiveZoomLink && isUpcoming && (
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <a
                      href={effectiveZoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      data-tina-field={tinaField(event, 'zoomLink')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join via Zoom
                    </a>
                  </div>
                )}

                {event.youtubeId && (
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <a
                      href={`https://youtube.com/watch?v=${event.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                      data-tina-field={tinaField(event, 'youtubeId')}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Watch Recording
                    </a>
                  </div>
                )}
                {event.vimeoId && !event.youtubeId && (
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <a
                      href={`https://vimeo.com/${event.vimeoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Watch Recording
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              {event.youtubeId && (
                <div className="mb-8">
                  <div className="aspect-video rounded-xl overflow-hidden bg-neutral-900">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${event.youtubeId}`}
                      title={event.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
              {event.vimeoId && !event.youtubeId && (
                <div className="mb-8">
                  <div className="aspect-video rounded-xl overflow-hidden bg-neutral-900">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://player.vimeo.com/video/${event.vimeoId}`}
                      title={event.title}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">About This Program</h2>
                {event.body ? (
                  <div className="prose max-w-none" data-tina-field={tinaField(event, 'body')}>
                    <TinaMarkdown content={event.body as TinaMarkdownContent} />
                  </div>
                ) : (
                  <p
                    className="text-lg text-neutral-700 leading-relaxed"
                    data-tina-field={tinaField(event, 'description')}
                  >
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Interested in More Programs?</h2>
          <p className="text-neutral-600 mb-6">
            Join us every Sunday for engaging presentations on science, reason, ethics, and humanist values.
          </p>
          <a href="/events" className="inline-block bg-[var(--hgp-primary)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--hgp-mid)] transition-colors">
            View All Events
          </a>
        </div>
      </section>
    </>
  );
}
