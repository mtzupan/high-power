# High Power — Wind Turbine Discovery

Full-stack application for discovering and managing wind turbines.

## Stack

- **Backend**: Python, FastAPI, SQLModel, Alembic, SQLite
- **Frontend**: Next.js, TypeScript, Tailwind CSS

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the dev server
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000. Interactive docs at http://localhost:8000/docs.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000.

## Project Structure

```
high-power/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── config.py        # Environment settings
│   │   ├── database.py      # DB engine & session
│   │   ├── models/          # SQLModel entities
│   │   ├── schemas/         # Request/response DTOs
│   │   ├── services/        # Business logic
│   │   └── routers/         # API route handlers
│   ├── alembic/             # DB migrations
│   └── requirements.txt
├── frontend/
│   └── src/app/             # Next.js App Router
└── README.md
```

## API Endpoints

| Method | Path                    | Description       |
|--------|-------------------------|-------------------|
| GET    | /api/turbines/          | List all turbines |
| GET    | /api/turbines/{id}      | Get turbine by ID |
| POST   | /api/turbines/          | Create a turbine  |
| PUT    | /api/turbines/{id}      | Update a turbine  |
| DELETE | /api/turbines/{id}      | Delete a turbine  |
