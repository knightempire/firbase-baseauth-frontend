# Next.js Frontend - Bio Auth App

## Features
- Next.js 14 (React) with TypeScript
- Google sign-in via Firebase
- JWT authentication and refresh logic
- API integration with FastAPI backend
- Tailwind CSS for styling
- Docker and docker-compose support
- Environment-based configuration (`.env.local`)

## Project Structure
```
frontend/
  src/
    app/         # Main pages and components
    utils/       # API logic, types
    firebase.ts  # Firebase config
  public/        # Static assets
  .env.local     # Frontend environment variables
  Dockerfile
  docker-compose.yml
  README.md
```

## Setup

### 1. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in all required values.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Locally
```bash
npm run dev
```

### 4. Run with Docker
```bash
docker-compose up --build
```

## Environment Variables (`.env.local`)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_BACKEND_URL` (URL of your backend API)

## Notes
- All config/secrets must be set in `.env.local` (never commit secrets to git).
- The frontend expects the backend to be running and accessible at `NEXT_PUBLIC_BACKEND_URL`.
- For production, use secure values and proper secret management.

---


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

