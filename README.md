# ParkShare

A peer-to-peer parking spot rental platform where property owners list available parking spaces and renters discover and book spots in their area. Built with a Next.js frontend and FastAPI backend connected to Supabase.

## Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand, Google Maps API, Radix UI, Framer Motion

**Backend:** FastAPI, Uvicorn, Supabase (PostgreSQL), JWT authentication, bcrypt, Pydantic

## Features

- **Search & Filter** — Find parking spots by city, date/time availability, and price range
- **Interactive Map** — Google Maps integration with clickable spot markers
- **Real-time Availability** — Dynamic slot calculation accounting for existing bookings
- **User Authentication** — JWT-based sign up/sign in with secure password hashing
- **Booking Management** — Book spots, view history, cancel reservations with automatic pricing
- **Host Dashboard** — Create listings, set availability intervals, view bookings and stats

## Project Structure

```
frontend/           Next.js React application
├── app/            App router pages (home, signin, signup, dashboard, host)
├── components/     Reusable UI components (MapComponent, SearchOverlay, modals)
├── lib/            API client, Zustand store, auth utilities, data transforms
├── hooks/          Custom React hooks (useAuth)
└── types/          TypeScript type definitions

backend/            FastAPI Python application
├── main.py         API server with all endpoints
├── db.py           Supabase database initialization
└── requirements.txt
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- Google Maps API key
- Supabase project (URL + service role key)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

Start the server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_API=false
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get JWT token |
| GET | `/auth/me` | Current user |
| GET | `/spots` | List spots (filters: city, price, active) |
| POST | `/spots` | Create listing (auth required) |
| GET | `/spots/{id}/availability/{date}` | Available time slots |
| POST | `/bookings` | Create booking (auth required) |
| GET | `/bookings` | User's bookings (auth required) |
| DELETE | `/bookings/{id}` | Cancel booking (auth required) |

## Scripts

```bash
# Frontend
npm run dev        # Development server
npm run build      # Production build
npm run start      # Serve production build
npm run lint       # ESLint

# Backend
uvicorn main:app --reload    # Development with hot reload
```
