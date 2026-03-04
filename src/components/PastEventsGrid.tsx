import { useState, useMemo, useRef } from 'react';

const PAGE_SIZE = 9;

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export type PastEventItem = {
  slug: string;
  title: string;
  startTime: string;
  presenter: string;
  description: string;
  youtubeId?: string;
  vimeoId?: string;
  vimeoThumbnail?: string;
};

function parseDate(startTime: string) {
  return new Date(startTime.replace(' ', 'T'));
}

function formatDate(startTime: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parseDate(startTime));
}

function EventCard({ event }: { event: PastEventItem }) {
  const videoHref = event.youtubeId
    ? `https://youtube.com/watch?v=${event.youtubeId}`
    : `https://vimeo.com/${event.vimeoId}`;

  return (
    <div className="bg-neutral-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      {(event.youtubeId || event.vimeoId) && (
        <a
          href={videoHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-video bg-neutral-200 relative group cursor-pointer"
        >
          {event.youtubeId ? (
            <img
              src={`https://img.youtube.com/vi/${event.youtubeId}/hqdefault.jpg`}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : event.vimeoThumbnail ? (
            <img
              src={event.vimeoThumbnail}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-800">
              <svg className="w-16 h-16 text-white opacity-60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${event.youtubeId ? 'bg-red-600' : 'bg-blue-700'}`}>
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </a>
      )}

      <div className="p-6">
        <div className="text-sm text-[var(--hgp-primary)] font-semibold mb-2">
          {formatDate(event.startTime)}
        </div>
        <a href={`/events/${event.slug}`}>
          <h3 className="text-xl font-bold text-neutral-900 mb-2 line-clamp-2 hover:text-[var(--hgp-primary)] transition-colors">
            {event.title}
          </h3>
        </a>
        <p className="text-neutral-600 mb-3">{event.presenter}</p>
        <div className="flex items-center gap-4">
          <a
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-[var(--hgp-primary)] hover:text-[var(--hgp-primary)] font-medium text-sm"
          >
            View Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
          {(event.youtubeId || event.vimeoId) && (
            <a
              href={videoHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 font-medium text-sm ${event.youtubeId ? 'text-red-600 hover:text-red-700' : 'text-blue-700 hover:text-blue-800'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PastEventsGrid({ events }: { events: PastEventItem[] }) {
  const [query, setQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // 0-indexed
  const [page, setPage] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  // Derive available years from events
  const years = useMemo(() => {
    const set = new Set(events.map(e => parseDate(e.startTime).getFullYear()));
    return Array.from(set).sort((a, b) => b - a); // descending
  }, [events]);

  // Derive available months for selected year
  const monthsInYear = useMemo(() => {
    if (selectedYear === null) return [];
    const set = new Set(
      events
        .filter(e => parseDate(e.startTime).getFullYear() === selectedYear)
        .map(e => parseDate(e.startTime).getMonth())
    );
    return Array.from(set).sort((a, b) => a - b);
  }, [events, selectedYear]);

  const isFiltered = query.trim() !== '' || selectedYear !== null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter(e => {
      if (selectedYear !== null && parseDate(e.startTime).getFullYear() !== selectedYear) return false;
      if (selectedMonth !== null && parseDate(e.startTime).getMonth() !== selectedMonth) return false;
      if (q) {
        return (
          e.title.toLowerCase().includes(q) ||
          e.presenter.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, query, selectedYear, selectedMonth]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayed = isFiltered ? filtered : filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function selectYear(year: number | null) {
    setSelectedYear(year);
    setSelectedMonth(null);
    setPage(0);
  }

  function selectMonth(month: number | null) {
    setSelectedMonth(month);
    setPage(0);
  }

  function clearAll() {
    setQuery('');
    setSelectedYear(null);
    setSelectedMonth(null);
    setPage(0);
  }

  function goToPage(next: number) {
    setPage(next);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div ref={topRef}>
      {/* Search + filters */}
      <div className="mb-8 space-y-4">
        {/* Search input */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search by title, speaker, or keyword…"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--hgp-primary)] focus:border-transparent"
          />
        </div>

        {/* Year pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-neutral-500 mr-1">Year:</span>
          <button
            onClick={() => selectYear(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedYear === null ? 'bg-[var(--hgp-primary)] text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
          >
            All
          </button>
          {years.map(year => (
            <button
              key={year}
              onClick={() => selectYear(selectedYear === year ? null : year)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedYear === year ? 'bg-[var(--hgp-primary)] text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Month pills — only when a year is selected */}
        {selectedYear !== null && monthsInYear.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-neutral-500 mr-1">Month:</span>
            <button
              onClick={() => selectMonth(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedMonth === null ? 'bg-[var(--hgp-mid)] text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
            >
              All
            </button>
            {monthsInYear.map(m => (
              <button
                key={m}
                onClick={() => selectMonth(selectedMonth === m ? null : m)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedMonth === m ? 'bg-[var(--hgp-mid)] text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              >
                {MONTHS[m]}
              </button>
            ))}
          </div>
        )}

        {/* Result count + clear */}
        {isFiltered && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              {filtered.length === 0 ? 'No programs found' : `${filtered.length} program${filtered.length === 1 ? '' : 's'} found`}
            </p>
            <button
              onClick={clearAll}
              className="text-sm text-[var(--hgp-primary)] hover:underline font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className="bg-neutral-50 rounded-xl p-12 text-center">
          <p className="text-neutral-600">No programs match your search. <button onClick={clearAll} className="text-[var(--hgp-primary)] font-medium hover:underline">Clear filters</button></p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map(event => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      )}

      {/* Pagination — only when not filtered */}
      {!isFiltered && totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <span className="text-sm text-neutral-600">Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages - 1}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
