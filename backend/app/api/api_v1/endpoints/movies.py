from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.movie import Movie, MovieCreate, UserMovie, UserMovieCreate
from app.services.movie_service import MovieService
from app.services.auth_service import AuthService

router = APIRouter()

@router.get("/", response_model=List[Movie])
async def get_movies(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get movies with optional search"""
    movie_service = MovieService(db)
    return await movie_service.get_movies(skip=skip, limit=limit, search=search)

@router.get("/{movie_id}", response_model=Movie)
async def get_movie(movie_id: int, db: Session = Depends(get_db)):
    """Get movie by ID"""
    movie_service = MovieService(db)
    movie = await movie_service.get_movie(movie_id)
    if movie is None:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

@router.post("/", response_model=Movie)
async def create_movie(movie: MovieCreate, db: Session = Depends(get_db)):
    """Create a new movie"""
    movie_service = MovieService(db)
    return await movie_service.create_movie(movie)

@router.get("/search/external")
async def search_external_movies(
    query: str = Query(..., description="Search query"),
    db: Session = Depends(get_db)
):
    """Search movies from external API (TMDB)"""
    movie_service = MovieService(db)
    return await movie_service.search_external_movies(query)

@router.post("/user/watch-history", response_model=UserMovie)
async def add_to_watch_history(
    user_movie: UserMovieCreate,
    current_user = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Add movie to user's watch history"""
    movie_service = MovieService(db)
    return await movie_service.add_to_user_movies(current_user.id, user_movie)

@router.get("/user/watch-history", response_model=List[UserMovie])
async def get_watch_history(
    current_user = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's watch history"""
    movie_service = MovieService(db)
    return await movie_service.get_user_movies(current_user.id)

@router.get("/recommendations")
async def get_recommendations(
    current_user = Depends(AuthService.get_current_user),
    db: Session = Depends(get_db)
):
    """Get movie recommendations for user"""
    movie_service = MovieService(db)
    return await movie_service.get_recommendations(current_user.id)
