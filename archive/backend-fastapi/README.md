# PostgreSQL Setup Guide for Movie App

## Option 1: Install PostgreSQL Locally

### Step 1: Download and Install PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Download the PostgreSQL installer for Windows
3. Run the installer and follow the setup wizard
4. Remember the password you set for the `postgres` user

### Step 2: Create Database and User
1. Open pgAdmin (comes with PostgreSQL installation)
2. Connect to your PostgreSQL server using the password you set
3. Right-click on "Databases" → "Create" → "Database"
4. Name it `movieapp_db`
5. Open Query Tool and run these commands:

```sql
-- Create user
CREATE USER movieapp WITH PASSWORD 'movieapp123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE movieapp_db TO movieapp;

-- Connect to the database
\c movieapp_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO movieapp;
```

## Option 2: Use Docker (Recommended for Development)

### Step 1: Install Docker Desktop
1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop

### Step 2: Run PostgreSQL Container
```bash
docker run --name movieapp-postgres -e POSTGRES_DB=movieapp_db -e POSTGRES_USER=movieapp -e POSTGRES_PASSWORD=movieapp123 -p 5432:5432 -d postgres:15
```

## Verify Connection
You can test the connection using:
```bash
psql -h localhost -U movieapp -d movieapp_db
```
Password: `movieapp123`

## Backend Setup

### Step 1: Install Python Dependencies
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

### Step 2: Set up Environment Variables
Copy the `.env` file and update the values:
```
DATABASE_URL=postgresql://movieapp:movieapp123@localhost:5432/movieapp_db
SECRET_KEY=your-super-secret-key-change-this-in-production
```

### Step 3: Initialize Database
```bash
# Initialize Alembic
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### Step 4: Start the Backend
```bash
# Option 1: Use the start script
start.bat

# Option 2: Run manually
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## Next Steps

1. Get a TMDB API key from https://www.themoviedb.org/settings/api
2. Update the `TMDB_API_KEY` in your `.env` file
3. Test the API endpoints using the FastAPI docs interface
