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

## Phases

### Phase 1 (Complete) ✅
- ✅ Monorepo setup with workspaces
- ✅ PostgreSQL database schema (Users, Groups, GroupMembers, AvailabilitySlots)
- ✅ Express backend with auth endpoints
- ✅ React frontend with auth pages
- ✅ Tailwind CSS styling
- ✅ TypeScript throughout
- ✅ API client library
- ✅ Testing framework setup (Vitest)

### Phase 2 (Complete) ✅
- ✅ Group creation and management
- ✅ Join groups (group members)
- ✅ Single availability slot marking
- ✅ Bulk mark availability (drag-to-select ready)
- ✅ Overlap calculation engine
- ✅ Real-time polling (60s intervals)
- ✅ Group detail pages
- ✅ Availability marking UI
- ✅ Overlap visualization

### Phase 3 (Ready for) 📋
- Responsive design polish
- Edge case handling
- Performance optimization
- User feedback and error handling refinement
- Production deployment

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

## API Endpoints

### Auth
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user

### Groups
- `GET /health` - Health check
- `POST /groups` - Create group (requires auth)
- `GET /groups` - Get user's groups (requires auth)
- `GET /groups/:groupId` - Get group details (requires auth)
- `POST /groups/:groupId/join` - Join group (requires auth)
- `GET /groups/:groupId/members` - Get group members (requires auth)

### Availability
- `POST /groups/:groupId/availability` - Mark single availability (requires auth)
- `POST /groups/:groupId/availability/bulk` - Mark bulk availability (requires auth)
- `GET /groups/:groupId/availability` - Get group availability (requires auth)
- `GET /groups/:groupId/overlaps` - Get time overlaps (requires auth)

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
