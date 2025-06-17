# Movie App - Full Stack Application

A modern movie recommendation and management application built with React (frontend) and FastAPI (backend) with PostgreSQL database.

## 🚀 Quick Setup Guide

### Prerequisites
- Python 3.12+ installed
- Node.js 16+ and npm installed
- PostgreSQL database (see setup options below)

### 1. Clone and Install Dependencies

```bash
# Frontend dependencies (already installed)
cd frontend
npm install

# Backend dependencies (already installed with virtual environment)
cd ../backend
# Virtual environment and packages are already set up
```

### 2. Database Setup (Choose One Option)

#### Option A: Docker PostgreSQL (Recommended)
```bash
# Install Docker Desktop, then run:
docker run --name movieapp-postgres -e POSTGRES_PASSWORD=movieapp123 -e POSTGRES_DB=movieapp -p 5432:5432 -d postgres:15
```

#### Option B: Local PostgreSQL Installation
1. Download and install PostgreSQL from https://www.postgresql.org/download/
2. Create a database named `movieapp`
3. Create a user with password `movieapp123`

### 3. Environment Configuration
```bash
# Backend environment is already configured in backend/.env
# Optionally add your TMDB API key for movie data:
# TMDB_API_KEY=your_api_key_here
```

### 4. Database Migration
```bash
cd backend
# Activate virtual environment (if not already active)
venv\Scripts\activate

# Run database migrations
alembic upgrade head
```

### 5. Start the Application
```bash
# From project root directory
start-all.bat
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Project Structure

```
MovieAppWeb/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Theme, etc.)
│   │   └── utils/           # Utility functions
│   ├── public/              # Public assets
│   └── package.json         # Frontend dependencies
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── alembic/            # Database migrations
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # FastAPI app entry point
├── start-all.bat          # Start both frontend and backend
├── start-frontend.bat     # Start only frontend
└── README.md             # This file
```

## 🎬 Features

### Frontend (React)
- **Authentication**: Email/password login and signup with session persistence
- **Home Dashboard**: Personalized greeting and quick navigation
- **Movie Suggestions**: Multi-select genres, mood/tone selectors, custom requests
- **Watch History**: Track watched movies with ratings and dates
- **User Profile**: Account management and settings
- **Modern UI**: Clean, professional design with smooth animations
- **Dark Mode**: Default dark theme with toggle capability

### Backend (FastAPI)
- **RESTful API**: Complete CRUD operations for users and movies
- **Authentication**: JWT-based authentication with password hashing
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Movie Integration**: TMDB API integration for movie data
- **Data Validation**: Pydantic schemas for request/response validation
- **Database Migrations**: Alembic for schema versioning
- **API Documentation**: Auto-generated with Swagger UI

## 🚀 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide React
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Authentication**: JWT tokens, bcrypt password hashing
- **Database**: PostgreSQL with Alembic migrations
- **API Integration**: TMDB API for movie data
- **Development**: Hot reload for both frontend and backend

## �️ Development Commands

### Start Both Services
```bash
# Start both frontend and backend
start-all.bat

# Or start individually:
start-frontend.bat        # Frontend only
cd backend && start.bat   # Backend only
```

### Database Management
```bash
cd backend
venv\Scripts\activate

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# View migration history
alembic history
```

### API Testing
- Interactive API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc
- Test endpoints with curl or Postman

## 🎨 Design Features

- **Modern UI**: Clean, professional design with smooth animations
- **Responsive**: Desktop-first design that works on all screen sizes
- **Interactive**: Hover effects, transitions, and scroll-triggered animations
- **Accessible**: Focus states and keyboard navigation
- **Dark Mode**: Professional dark theme as default

## 🔧 Configuration

### Environment Variables
Backend configuration in `backend/.env`:
```env
DATABASE_URL=postgresql://movieapp:movieapp123@localhost/movieapp
SECRET_KEY=your-secret-key-here
TMDB_API_KEY=your-tmdb-api-key-here  # Optional
```

### Frontend Configuration
- API base URL configured in frontend for backend communication
- Tailwind CSS for styling with custom theme
- React Router for navigation (ready for implementation)

## 🚀 Deployment

### Frontend Build
```bash
cd frontend
npm run build
```

### Backend Deployment
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Database Setup for Production
1. Set up PostgreSQL server
2. Update DATABASE_URL in production environment
3. Run migrations: `alembic upgrade head`

## 📋 Troubleshooting

### Common Issues

**Database Connection Error**
- Ensure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Verify database exists and credentials are correct

**Frontend Not Loading**
- Check if backend is running on port 8000
- Verify frontend is running on port 3000
- Check browser console for errors

**Backend Import Errors**
- Ensure virtual environment is activated
- Install requirements: `pip install -r requirements.txt`
- Check Python path is set correctly

## 🔮 Next Development Steps

### Immediate Tasks
- [ ] Set up PostgreSQL database
- [ ] Run initial database migrations
- [ ] Test API endpoints
- [ ] Connect frontend to backend API
- [ ] Add TMDB API key for movie data

### Future Enhancements
- [ ] User authentication flow in frontend
- [ ] Movie search and recommendation engine
- [ ] Social features (friends, sharing)
- [ ] Advanced filtering and search
- [ ] Mobile responsive improvements
- [ ] Movie trailers and images integration
- [ ] Watchlist and favorites functionality
- [ ] Performance optimization and caching

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
