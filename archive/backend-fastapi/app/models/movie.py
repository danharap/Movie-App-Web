from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Movie(Base):
    __tablename__ = "movies"
    
    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True)
    title = Column(String, nullable=False)
    year = Column(Integer)
    genre = Column(String)
    director = Column(String)
    poster = Column(String)
    tmdb_rating = Column(Float)
    summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserMovie(Base):
    __tablename__ = "user_movies"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
    rating = Column(Float)
    is_saved = Column(Integer, default=0)  # 0 = not saved, 1 = saved
    watched_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    movie = relationship("Movie")
