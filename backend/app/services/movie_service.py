from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
from app.models.movie import Movie, UserMovie
from app.schemas.movie import MovieCreate, UserMovieCreate
from app.core.config import settings

class MovieService:
    def __init__(self, db: Session):
        self.db = db

    async def get_movies(self, skip: int = 0, limit: int = 100, search: Optional[str] = None):
        query = self.db.query(Movie)
        if search:
            query = query.filter(Movie.title.ilike(f"%{search}%"))
        return query.offset(skip).limit(limit).all()

    async def get_movie(self, movie_id: int):
        return self.db.query(Movie).filter(Movie.id == movie_id).first()

    async def create_movie(self, movie: MovieCreate):
        db_movie = Movie(**movie.dict())
        self.db.add(db_movie)
        self.db.commit()
        self.db.refresh(db_movie)
        return db_movie

    async def search_external_movies(self, query: str):
        """Search movies from TMDB API"""
        if not settings.TMDB_API_KEY:
            return {"error": "TMDB API key not configured"}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{settings.TMDB_BASE_URL}/search/movie",
                    params={
                        "api_key": settings.TMDB_API_KEY,
                        "query": query,
                        "language": "en-US",
                        "page": 1
                    }
                )
                response.raise_for_status()
                return response.json()
            except httpx.RequestError as e:
                return {"error": f"Request failed: {str(e)}"}

    async def add_to_user_movies(self, user_id: int, user_movie: UserMovieCreate):
        """Add movie to user's collection"""
        db_user_movie = UserMovie(
            user_id=user_id,
            **user_movie.dict()
        )
        self.db.add(db_user_movie)
        self.db.commit()
        self.db.refresh(db_user_movie)
        return db_user_movie

    async def get_user_movies(self, user_id: int):
        """Get user's movie collection"""
        return self.db.query(UserMovie).filter(UserMovie.user_id == user_id).all()

    async def get_recommendations(self, user_id: int):
        """Get movie recommendations based on user's watch history"""
        # Basic recommendation logic - in production, this would be more sophisticated
        user_movies = await self.get_user_movies(user_id)
        
        if not user_movies:
            # Return popular movies if user has no history
            return await self.get_popular_movies()
        
        # Get genres from user's highly rated movies
        liked_genres = []
        for user_movie in user_movies:
            if user_movie.rating and user_movie.rating >= 4.0:
                if user_movie.movie.genre:
                    liked_genres.append(user_movie.movie.genre)
        
        if liked_genres:
            # Return movies from liked genres that user hasn't watched
            watched_movie_ids = [um.movie_id for um in user_movies]
            recommendations = self.db.query(Movie).filter(
                Movie.genre.in_(liked_genres),
                ~Movie.id.in_(watched_movie_ids)
            ).limit(10).all()
            return recommendations
        
        return await self.get_popular_movies()

    async def get_popular_movies(self):
        """Get popular movies from TMDB"""
        if not settings.TMDB_API_KEY:
            # Return some from local database if no API key
            return self.db.query(Movie).filter(Movie.tmdb_rating >= 7.0).limit(10).all()
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{settings.TMDB_BASE_URL}/movie/popular",
                    params={
                        "api_key": settings.TMDB_API_KEY,
                        "language": "en-US",
                        "page": 1
                    }
                )
                response.raise_for_status()
                return response.json()
            except httpx.RequestError:
                # Fallback to local database
                return self.db.query(Movie).filter(Movie.tmdb_rating >= 7.0).limit(10).all()
