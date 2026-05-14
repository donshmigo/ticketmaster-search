# Tixcket

A Vite + React website for searching Ticketmaster events with the Ticketmaster Discovery API.

## Setup

1. Install dependencies:

```sh
npm install
```

2. Create `.env.local` from the example file:

```sh
cp .env.example .env.local
```

3. Add your Ticketmaster API key:

```sh
VITE_TICKETMASTER_API_KEY=your_real_key
```

4. Start the app:

```sh
npm run dev
```

## What It Does

Search upcoming Ticketmaster events by keyword, city, category, and start date. Results show official event imagery, date, time, venue, location, category, and a direct link to the Ticketmaster event page.

Because this app calls Ticketmaster from the browser, the `VITE_TICKETMASTER_API_KEY` value is included in the client bundle. Use a server proxy if you need to keep the key private.
