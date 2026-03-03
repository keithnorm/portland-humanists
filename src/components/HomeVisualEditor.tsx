import React from 'react';
import { useTina, tinaField } from 'tinacms/dist/react';

import type { HomepageQuery, HomepageQueryVariables } from '../../tina/__generated__/types';

interface EventItem {
  slug: string;
  data: {
    title: string;
    presenter: string;
    presenterTitle: string;
    startTime: string;
    endTime: string;
    location: string;
    zoomLink?: string;
    youtubeId?: string;
    status: string;
    description: string;
  };
}

interface Props {
  query: string;
  variables: HomepageQueryVariables;
  data: HomepageQuery;
  upcomingEvents: EventItem[];
  recentRecordings: EventItem[];
}

function parseTime(startTime: string): Date | null {
  try {
    const date = new Date(startTime.replace(' ', 'T'));
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
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
    return `${hour % 12 || 12}:${minutes} ${ampm}`;
  } catch {
    return null;
  }
}

// Icons keyed by feature index — fixed design, text is editable
const featureIcons = [
  // Science & Reason
  <svg key="0" className="w-8 h-8 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>,
  // Community
  <svg key="1" className="w-8 h-8 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>,
  // Compassion
  <svg key="2" className="w-8 h-8 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>,
];

const MAPS_URL = 'https://maps.google.com/?q=Friendly+House+Community+Center+1737+NW+26th+Ave+Portland+OR+97210';

function LocationText({ location }: { location: string }) {
  if (!location.toLowerCase().includes('friendly house')) {
    return <>{location}</>;
  }
  return (
    <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {location}
    </a>
  );
}

const perks = [
  {
    label: 'Every Sunday',
    sub: '9:45 – 11:30 AM',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Free & open to all',
    sub: 'No membership required',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    label: 'In-person + Zoom',
    sub: 'Friendly House, NW Portland',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Childcare available',
    sub: 'First Sunday of the month',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: 'Live music',
    sub: 'Before each program',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
  {
    label: 'Coffee & conversation',
    sub: 'After the program',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
];

export function HomeVisualEditor({ query, variables, data, upcomingEvents, recentRecordings }: Props) {
  const { data: tinaData } = useTina({ query, variables, data });
  const home = tinaData.homepage;

  const upcomingEvent = upcomingEvents[0] ?? null;
  const upcomingDate = upcomingEvent ? parseTime(upcomingEvent.data.startTime) : null;

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a5f] via-[#2a4d7f] to-[#4a90e2] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              data-tina-field={tinaField(home, 'heroHeading')}
            >
              {home.heroHeading}
            </h1>
            <p
              className="text-xl md:text-2xl text-[#c8d9ec] mb-8 leading-relaxed"
              data-tina-field={tinaField(home, 'heroTagline')}
            >
              {home.heroTagline}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#upcoming-events" className="bg-white text-[#1e3a5f] px-6 py-3 rounded-lg font-semibold hover:bg-[#f4f7fb] transition-colors inline-flex items-center gap-2">
                See Upcoming Programs
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <a href="/join" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#1e3a5f] transition-colors">
                Join Our Community
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Programs */}
      <section id="upcoming-events" className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#4a90e2] mb-2">Every Sunday · 9:45 AM</p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Upcoming Sunday Programs</h2>
            <p className="text-lg text-neutral-600">Free and open to everyone — join us in person or via Zoom</p>
          </div>

          {/* Featured next event */}
          {upcomingEvent && upcomingDate ? (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-2/5 bg-gradient-to-br from-[#2a4d7f] to-[#4a90e2] p-8 flex flex-col justify-center items-center text-white">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">
                      {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(upcomingDate).toUpperCase()}
                    </div>
                    <div className="text-7xl font-bold mb-2">{upcomingDate.getDate()}</div>
                    <div className="text-xl">
                      {new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(upcomingDate)}
                    </div>
                  </div>
                </div>
                <div className="md:w-3/5 p-8">
                  <a href={`/events/${upcomingEvent.slug}`}>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-4 hover:text-[#1e3a5f] transition-colors">
                      {upcomingEvent.data.title}
                    </h3>
                  </a>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#1e3a5f] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <div className="font-semibold text-neutral-900">{upcomingEvent.data.presenter}</div>
                        <div className="text-sm text-neutral-600">{upcomingEvent.data.presenterTitle}</div>
                      </div>
                    </div>
                    {formatTime(upcomingEvent.data.startTime) && (
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-[#1e3a5f] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-neutral-700">
                          {formatTime(upcomingEvent.data.startTime)} - {formatTime(upcomingEvent.data.endTime)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#1e3a5f] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-neutral-700"><LocationText location={upcomingEvent.data.location} /></span>
                    </div>
                  </div>
                  <p className="text-neutral-600 mb-6 leading-relaxed">{upcomingEvent.data.description}</p>
                  <div className="flex items-center gap-4">
                    {upcomingEvent.data.zoomLink && (
                      <a href={upcomingEvent.data.zoomLink} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Join via Zoom
                      </a>
                    )}
                    <a href={`/events/${upcomingEvent.slug}`} className="inline-flex items-center gap-2 text-[#1e3a5f] font-semibold">
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-neutral-600 text-lg">No upcoming events scheduled at this time. Check back soon!</p>
            </div>
          )}

          {/* Remaining upcoming events — compact cards */}
          {upcomingEvents.length > 1 && (
            <div className="max-w-4xl mx-auto mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingEvents.slice(1).map(event => {
                const date = parseTime(event.data.startTime);
                return (
                  <a
                    key={event.slug}
                    href={`/events/${event.slug}`}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-start"
                  >
                    {date && (
                      <div className="flex-shrink-0 w-11 text-center pt-0.5">
                        <div className="text-xs font-bold uppercase text-[#4a90e2] leading-none mb-1">
                          {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)}
                        </div>
                        <div className="text-2xl font-bold text-[#1e3a5f] leading-none">{date.getDate()}</div>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-neutral-900 text-sm leading-snug mb-1 line-clamp-2">
                        {event.data.title}
                      </h3>
                      <p className="text-xs text-neutral-500 truncate">{event.data.presenter}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* Perks strip */}
          <div className="max-w-4xl mx-auto mt-10 pt-8 border-t border-neutral-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              {perks.map(perk => (
                <div key={perk.label} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-[#e8eef5] rounded-full flex items-center justify-center text-[#1e3a5f]">
                    {perk.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-800 leading-snug">{perk.label}</div>
                    <div className="text-xs text-neutral-500 leading-snug">{perk.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What is Humanism */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6"
              data-tina-field={tinaField(home, 'humanismHeading')}
            >
              {home.humanismHeading}
            </h2>
            <p
              className="text-lg text-neutral-700 leading-relaxed mb-6"
              data-tina-field={tinaField(home, 'humanismBody1')}
            >
              {home.humanismBody1}
            </p>
            <p
              className="text-lg text-neutral-700 leading-relaxed"
              data-tina-field={tinaField(home, 'humanismBody2')}
            >
              {home.humanismBody2}
            </p>
          </div>

          {home.features && home.features.length > 0 && (
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              {home.features.map((feature, i) => {
                if (!feature) return null;
                return (
                  <div key={i} className="text-center p-6">
                    <div className="w-16 h-16 bg-[#e8eef5] rounded-full flex items-center justify-center mx-auto mb-4">
                      {featureIcons[i]}
                    </div>
                    <h3
                      className="text-xl font-bold text-neutral-900 mb-2"
                      data-tina-field={tinaField(feature, 'title')}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-neutral-600"
                      data-tina-field={tinaField(feature, 'description')}
                    >
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Recent Recordings — read-only, edit via Sunday Programs */}
      {recentRecordings.length > 0 && (
        <section className="py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Recent Recordings</h2>
                <p className="text-lg text-neutral-600">Catch up on programs you may have missed</p>
              </div>
              <a href="/events" className="text-[#1e3a5f] font-semibold flex items-center gap-2">
                View All
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {recentRecordings.map(event => {
                const date = parseTime(event.data.startTime);
                return (
                  <div key={event.slug} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <a href={`/events/${event.slug}`}>
                      <div className="aspect-video bg-neutral-200 relative group cursor-pointer">
                        <img
                          src={`https://img.youtube.com/vi/${event.data.youtubeId}/hqdefault.jpg`}
                          alt={event.data.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </a>
                    <div className="p-6">
                      {date && <div className="text-sm text-[#1e3a5f] font-semibold mb-2">{formatDate(date)}</div>}
                      <a href={`/events/${event.slug}`}>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2 hover:text-[#1e3a5f] transition-colors">
                          {event.data.title}
                        </h3>
                      </a>
                      <p className="text-neutral-600">{event.data.presenter}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#1e3a5f] to-[#2a4d7f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6"
            data-tina-field={tinaField(home, 'ctaHeading')}
          >
            {home.ctaHeading}
          </h2>
          <p
            className="text-xl text-[#c8d9ec] mb-8 max-w-2xl mx-auto"
            data-tina-field={tinaField(home, 'ctaBody')}
          >
            {home.ctaBody}
          </p>
          <a href="/join" className="inline-block bg-white text-[#1e3a5f] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#f4f7fb] transition-colors">
            Become a Member Today
          </a>
        </div>
      </section>
    </>
  );
}
