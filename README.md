# Yellow House MVP

A scheduling coordination app to find overlapping availability across a group of people.

## Project Structure

```
.
├── packages/
│   ├── shared/           # Shared types and utilities
│   ├── backend/          # Express.js API server
│   └── frontend/         # React + Vite + Tailwind
├── README.md
└── package.json         # Monorepo workspace config
```

## Phase 1 (Complete)

- ✅ Monorepo setup with workspaces
- ✅ PostgreSQL database schema
- ✅ Express backend with auth endpoints
- ✅ React frontend with auth pages
- ✅ Tailwind CSS styling
- ✅ TypeScript throughout
- ✅ API client library

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 12+

### Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create PostgreSQL database:
```bash
createdb yellow-house
```

3. Setup backend:
```bash
cd packages/backend
cp .env.example .env
# Edit .env with your database URL
pnpm db:migrate
```

4. Start development:
```bash
# Terminal 1: Backend
pnpm dev:backend

# Terminal 2: Frontend
pnpm dev:frontend
```

The app will be at `http://localhost:5173`

## API Endpoints (Phase 1)

- `GET /health` - Health check
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user

## Next Steps (Phase 2)

- User login/signup flows
- Group creation and management
- Availability marking (single and bulk)
- Overlap calculation
- Real-time polling
- Responsive design refinement

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Package Manager**: pnpm (workspaces)
- **Testing**: Vitest (setup ready)

## Development

```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Build
pnpm build
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://localhost:5432/yellow-house
PORT=3001
JWT_SECRET=your-secret-key
```

### Frontend (via vite config)
```
VITE_API_URL=http://localhost:3001
```
