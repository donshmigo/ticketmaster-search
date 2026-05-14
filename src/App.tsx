import { type FormEvent, useState } from 'react'
import {
  searchEvents,
  TicketmasterError,
  type EventCard,
  type EventSearchParams,
} from './lib/ticketmaster'
import './App.css'

const categories = ['', 'Music', 'Sports', 'Arts & Theatre', 'Family', 'Film', 'Miscellaneous']
const quickSearches = ['concerts', 'soccer', 'comedy', 'broadway']
const stats = [
  { value: '18', label: 'matches per search' },
  { value: '24/7', label: 'live discovery' },
  { value: '100%', label: 'official links' },
]
const trustSignals = ['Verified Ticketmaster inventory', 'Fast city and date filters', 'Mobile-first discovery']
const ticketmasterApiKey = import.meta.env.VITE_TICKETMASTER_API_KEY ?? ''

function App() {
  const [filters, setFilters] = useState<EventSearchParams>({
    keyword: '',
    city: '',
    classificationName: '',
    startDate: '',
  })
  const [events, setEvents] = useState<EventCard[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState(
    ticketmasterApiKey
      ? 'Search official events by artist, team, city, category, or date.'
      : 'Add VITE_TICKETMASTER_API_KEY to .env.local before searching.',
  )

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setMessage('Checking Ticketmaster for the best upcoming matches...')

    try {
      const results = await searchEvents(ticketmasterApiKey, filters)
      setEvents(results)
      setStatus('success')
      setMessage(
        results.length
          ? `Found ${results.length} upcoming ${results.length === 1 ? 'event' : 'events'}.`
          : 'No events matched that search. Try a broader keyword or a nearby city.',
      )
    } catch (error) {
      setEvents([])
      setStatus('error')
      setMessage(
        error instanceof TicketmasterError
          ? error.message
          : 'Something went wrong while searching Ticketmaster.',
      )
    }
  }

  function updateFilter<K extends keyof EventSearchParams>(key: K, value: EventSearchParams[K]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function applyQuickSearch(keyword: string) {
    setFilters((current) => ({ ...current, keyword }))
  }

  return (
    <main className="shell">
      <header className="topbar" aria-label="Site header">
        <a className="brand" href="/" aria-label="Tixcket home">
          <span className="brand__mark">tx</span>
          <span>Tixcket</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#discover">Discover</a>
          <a href="#search">Search</a>
          <a href="#events">Events</a>
        </nav>
        <a className="topbar__cta" href="#search">
          Find tickets
        </a>
      </header>

      <section className="hero" id="discover" aria-labelledby="page-title">
        <div className="hero__grid">
          <div>
            <div className="hero__eyebrow">A cleaner way to discover live events</div>
            <h1 id="page-title">Find the best tickets without the chaos.</h1>
            <p className="hero__copy">
              Search official Ticketmaster inventory through a faster, calmer marketplace interface
              built for concerts, sports, theatre, and last-minute plans.
            </p>
            <div className="hero__actions" aria-label="Popular searches">
              <a href="#search">Start searching</a>
              <button type="button" onClick={() => applyQuickSearch('concerts')}>
                Try concerts
              </button>
            </div>
          </div>

          <aside className="hero__panel" aria-label="Marketplace highlights">
            <div className="hero__panel-header">
              <span>Live feed</span>
              <strong>Now searching</strong>
            </div>
            <div className="hero__mock-card">
              <span className="hero__mock-date">Fri 08</span>
              <div>
                <strong>Stadium Night Pass</strong>
                <p>Los Angeles · Verified marketplace result</p>
              </div>
            </div>
            <div className="hero__mock-card hero__mock-card--accent">
              <span className="hero__mock-date">Sat 16</span>
              <div>
                <strong>Front Row Comedy</strong>
                <p>New York · Direct Ticketmaster link</p>
              </div>
            </div>
            <ul>
              {trustSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="stats-grid" aria-label="Platform stats">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="search-panel" id="search" aria-label="Event search">
        <div className="section-heading">
          <span>Search marketplace</span>
          <h2>Tell us what you want to see live.</h2>
        </div>
        <form onSubmit={handleSearch}>
          <div className="field field--wide">
            <label htmlFor="keyword">Event, artist, team, or keyword</label>
            <input
              id="keyword"
              name="keyword"
              placeholder="Try Bad Bunny, Lakers, Formula 1..."
              value={filters.keyword}
              onChange={(event) => updateFilter('keyword', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              placeholder="Los Angeles"
              value={filters.city}
              onChange={(event) => updateFilter('city', event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="classificationName">Category</label>
            <select
              id="classificationName"
              name="classificationName"
              value={filters.classificationName}
              onChange={(event) => updateFilter('classificationName', event.target.value)}
            >
              {categories.map((category) => (
                <option key={category || 'all'} value={category}>
                  {category || 'All categories'}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="startDate">From date</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={(event) => updateFilter('startDate', event.target.value)}
            />
          </div>

          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Searching...' : 'Search events'}
          </button>
        </form>

        <div className="quick-searches" aria-label="Quick keyword searches">
          <span>Popular:</span>
          {quickSearches.map((keyword) => (
            <button key={keyword} type="button" onClick={() => applyQuickSearch(keyword)}>
              {keyword}
            </button>
          ))}
        </div>
      </section>

      <section className={`status-card status-card--${status}`} aria-live="polite">
        <span>{status === 'loading' ? 'Searching' : status === 'error' ? 'Heads up' : 'Status'}</span>
        <p>{message}</p>
      </section>

      <section className="events-section" id="events" aria-label="Ticketmaster event results">
        <div className="section-heading">
          <span>Event feed</span>
          <h2>{events.length ? 'Best matches for you' : 'Search results will land here'}</h2>
        </div>

        {events.length ? (
          <div className="results">
            {events.map((event) => (
              <article className="event-card" key={event.id}>
                <div className="event-card__image">
                  {event.image ? <img src={event.image} alt="" /> : <span>No image</span>}
                </div>
                <div className="event-card__body">
                  <div className="event-card__meta">
                    <span>{event.dateLabel}</span>
                    <span>{event.timeLabel}</span>
                  </div>
                  <h3>{event.name}</h3>
                  <p>{event.venue}</p>
                  <p>{event.location}</p>
                  <div className="event-card__footer">
                    <span>{event.category}</span>
                    <a href={event.url} target="_blank" rel="noreferrer">
                      View tickets
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div>
              <span>Discovery tip</span>
              <h3>Start with a city and one thing you want to see.</h3>
              <p>
                Tixcket keeps the flow simple: search official inventory, scan clean cards, then
                jump to Ticketmaster when you are ready to buy.
              </p>
            </div>
            <button type="button" onClick={() => applyQuickSearch('concerts')}>
              Try concerts
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
