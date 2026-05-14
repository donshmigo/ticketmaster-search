import { type FormEvent, useState } from 'react'
import {
  searchEvents,
  TicketmasterError,
  type EventCard,
  type EventSearchParams,
} from './lib/ticketmaster'
import './App.css'

const categories = ['', 'Music', 'Sports', 'Arts & Theatre', 'Family', 'Film', 'Miscellaneous']
const quickSearches = ['jazz', 'soccer', 'comedy', 'broadway']
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
      ? 'Search by artist, team, city, or genre to discover upcoming Ticketmaster events.'
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
      <section className="hero" aria-labelledby="page-title">
        <div className="hero__eyebrow">Ticketmaster Discovery</div>
        <div className="hero__grid">
          <div>
            <h1 id="page-title">Find the next show worth clearing your calendar for.</h1>
            <p className="hero__copy">
              Search Ticketmaster events by performer, team, city, category, and date. Every result
              links straight to the official event page.
            </p>
          </div>
          <aside className="hero__stub" aria-label="Featured search details">
            <span>Live Index</span>
            <strong>18</strong>
            <p>upcoming events per search, sorted by nearest date</p>
          </aside>
        </div>
      </section>

      <section className="search-panel" aria-label="Event search">
        <form onSubmit={handleSearch}>
          <div className="field field--wide">
            <label htmlFor="keyword">Event, artist, team, or keyword</label>
            <input
              id="keyword"
              name="keyword"
              placeholder="Try Bad Bunny, Lakers, jazz..."
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

      <section className="results" aria-label="Ticketmaster event results">
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
              <h2>{event.name}</h2>
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
      </section>
    </main>
  )
}

export default App
