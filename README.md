# Job Hunting Support App

## Project Structure

- **frontend/**: Next.js application
  - Setup: `cd frontend` -> `npm install` -> `npm run dev`
  - Environment: Rename `env.example` to `.env.local` and fill in Supabase credentials.

- **backend/**: FastAPI application
  - Setup: `cd backend` -> `python -m venv venv` -> `.\venv\Scripts\activate` -> `pip install -r requirements.txt`
  - Run: `uvicorn main:app --reload`
  - Environment: Rename `env.example` to `.env` and fill in credentials.

- **docs/**: Project specifications and documentation.

## Phase 1 MVP Features
- Authentication (Supabase)
- Company Management
- Events/Calendar
- Todo List

