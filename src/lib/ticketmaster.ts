const DISCOVERY_EVENTS_URL = 'https://app.ticketmaster.com/discovery/v2/events.json'

export type EventSearchParams = {
  keyword: string
  city: string
  classificationName: string
  startDate: string
}

type TicketmasterImage = {
  ratio?: string
  url?: string
  width?: number
  height?: number
}

type TicketmasterVenue = {
  name?: string
  city?: {
    name?: string
  }
  state?: {
    stateCode?: string
    name?: string
  }
}

type TicketmasterEvent = {
  id: string
  name: string
  url?: string
  images?: TicketmasterImage[]
  dates?: {
    start?: {
      localDate?: string
      localTime?: string
      dateTime?: string
    }
    status?: {
      code?: string
    }
  }
  classifications?: Array<{
    segment?: {
      name?: string
    }
    genre?: {
      name?: string
    }
  }>
  _embedded?: {
    venues?: TicketmasterVenue[]
  }
}

type TicketmasterResponse = {
  _embedded?: {
    events?: TicketmasterEvent[]
  }
  page?: {
    totalElements?: number
  }
}

export type EventCard = {
  id: string
  name: string
  url: string
  image: string
  dateLabel: string
  timeLabel: string
  venue: string
  location: string
  category: string
  status: string
}

export class TicketmasterError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TicketmasterError'
  }
}

export async function searchEvents(
  apiKey: string,
  filters: EventSearchParams,
): Promise<EventCard[]> {
  const key = apiKey.trim()

  if (!key) {
    throw new TicketmasterError('Add your Ticketmaster API key to .env.local to start searching.')
  }

  const params = new URLSearchParams({
    apikey: key,
    size: '18',
    sort: 'date,asc',
  })

  const keyword = filters.keyword.trim()
  const city = filters.city.trim()

  if (keyword) {
    params.set('keyword', keyword)
  }

  if (city) {
    params.set('city', city)
  }

  if (filters.classificationName) {
    params.set('classificationName', filters.classificationName)
  }

  if (filters.startDate) {
    params.set('startDateTime', `${filters.startDate}T00:00:00Z`)
  }

  const response = await fetch(`${DISCOVERY_EVENTS_URL}?${params.toString()}`)

  if (!response.ok) {
    if (response.status === 401) {
      throw new TicketmasterError('Ticketmaster rejected the API key. Check VITE_TICKETMASTER_API_KEY.')
    }

    throw new TicketmasterError(`Ticketmaster search failed with status ${response.status}.`)
  }

  const data = (await response.json()) as TicketmasterResponse
  const events = data._embedded?.events ?? []

  return events.map(normalizeEvent)
}

function normalizeEvent(event: TicketmasterEvent): EventCard {
  const venue = event._embedded?.venues?.[0]
  const classification = event.classifications?.[0]
  const date = event.dates?.start?.localDate
  const time = event.dates?.start?.localTime

  return {
    id: event.id,
    name: event.name,
    url: event.url ?? '#',
    image: chooseImage(event.images),
    dateLabel: formatDate(date),
    timeLabel: formatTime(time),
    venue: venue?.name ?? 'Venue TBA',
    location: formatLocation(venue),
    category: classification?.genre?.name ?? classification?.segment?.name ?? 'Live event',
    status: event.dates?.status?.code ?? 'onsale',
  }
}

function chooseImage(images: TicketmasterImage[] = []): string {
  const preferred =
    images.find((image) => image.ratio === '16_9' && image.width && image.width >= 640) ??
    images.find((image) => image.ratio === '16_9') ??
    images[0]

  return preferred?.url ?? ''
}

function formatDate(date?: string): string {
  if (!date) {
    return 'Date TBA'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function formatTime(time?: string): string {
  if (!time) {
    return 'Time TBA'
  }

  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(`1970-01-01T${time}`))
}

function formatLocation(venue?: TicketmasterVenue): string {
  const city = venue?.city?.name
  const state = venue?.state?.stateCode ?? venue?.state?.name

  return [city, state].filter(Boolean).join(', ') || 'Location TBA'
}
