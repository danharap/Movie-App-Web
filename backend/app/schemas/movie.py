from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MovieBase(BaseModel):
    title: str
    year: Optional[int] = None
    genre: Optional[str] = None
    director: Optional[str] = None
    poster: Optional[str] = None
    tmdb_rating: Optional[float] = None
    summary: Optional[str] = None

class MovieCreate(MovieBase):
    tmdb_id: Optional[int] = None

class Movie(MovieBase):
    id: int
    tmdb_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserMovieBase(BaseModel):
    movie_id: int
    rating: Optional[float] = None
    is_saved: Optional[int] = 0

class UserMovieCreate(UserMovieBase):
    pass

class UserMovie(UserMovieBase):
    id: int
    user_id: int
    watched_at: datetime
    movie: Movie
    
    class Config:
        from_attributes = True
