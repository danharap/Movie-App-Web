import React, { useState } from 'react';
import { Star, Clock, Calendar, Edit, Trash2, History, Filter, Search, Grid, List, Eye, Heart, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const WatchHistoryPage = ({ watchHistory, updateRating, removeFromHistory }) => {
  const { isDarkMode } = useTheme();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'rating', 'title'
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced movie data with posters for demo
  const enhancedHistory = watchHistory.map(movie => ({
    ...movie,
    poster: `https://image.tmdb.org/t/p/w500${movie.poster_path || '/placeholder.jpg'}`,
    backdrop: `https://image.tmdb.org/t/p/w1920${movie.backdrop_path || '/placeholder.jpg'}`,
    director: movie.director || 'Unknown Director',
    cast: movie.cast || ['Actor 1', 'Actor 2'],
    review: movie.review || '',
    tags: movie.tags || ['drama', 'thriller'],
    letterboxdUrl: `https://letterboxd.com/film/${movie.title?.toLowerCase().replace(/\s+/g, '-')}/`
  }));

  // Filter and sort logic
  const filteredHistory = enhancedHistory
    .filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = filterRating === 'all' || 
        (filterRating === '4+' && movie.rating >= 4) ||
        (filterRating === '3+' && movie.rating >= 3) ||
        movie.rating.toString() === filterRating;
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          return new Date(b.watchDate) - new Date(a.watchDate);
      }
    });

  const renderStars = (rating, movieId, size = 'w-4 h-4') => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => updateRating(movieId, star)}
          className={`${size} transition-all duration-200 hover:scale-110 ${
            star <= rating 
              ? 'text-yellow-400 drop-shadow-sm' 
              : isDarkMode ? 'text-gray-600 hover:text-yellow-300' : 'text-gray-300 hover:text-yellow-400'
          }`}
        >
          <Star className={`${size} ${star <= rating ? 'fill-current' : ''}`} />
        </button>
      ))}
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {filteredHistory.map(movie => (
        <div key={movie.id} className="group relative">
          {/* Movie Poster */}
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
            <img
              src={movie.poster || `https://via.placeholder.com/300x450/1f2937/ffffff?text=${encodeURIComponent(movie.title)}`}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/300x450/${isDarkMode ? '1f2937' : 'f3f4f6'}/${isDarkMode ? 'ffffff' : '000000'}?text=${encodeURIComponent(movie.title)}`;
              }}
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="text-center text-white space-y-2">
                <div className="text-sm font-medium">{movie.title}</div>
                <div className="text-xs">{movie.year}</div>
                {renderStars(movie.rating, movie.id)}
                <div className="flex space-x-2 mt-2">
                  <button className="p-1 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all">
                    <Edit className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => removeFromHistory(movie.id)}
                    className="p-1 bg-red-500 bg-opacity-70 rounded-full hover:bg-opacity-90 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Rating badge */}
            {movie.rating > 0 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                <Star className="w-3 h-3 fill-current text-yellow-400" />
                <span>{movie.rating}</span>
              </div>
            )}

            {/* Watch date */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-full">
              {new Date(movie.watchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>

          {/* Title below poster */}
          <div className="mt-2 text-center">
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
              {movie.title}
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {movie.year}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
  const ListView = () => (
    <div className="space-y-4">
      {filteredHistory.map(movie => (
        <div key={movie.id} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 hover:shadow-lg transition-all duration-300`}>
          <div className="flex space-x-4">
            {/* Movie Poster */}
            <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden shadow-md">
              <img
                src={movie.poster || `https://via.placeholder.com/100x150/${isDarkMode ? '1f2937' : 'f3f4f6'}/${isDarkMode ? 'ffffff' : '000000'}?text=${encodeURIComponent(movie.title.substring(0, 10))}`}
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/100x150/${isDarkMode ? '1f2937' : 'f3f4f6'}/${isDarkMode ? 'ffffff' : '000000'}?text=${encodeURIComponent(movie.title.substring(0, 10))}`;
                }}
              />
            </div>

            {/* Movie Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    {movie.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm mb-2">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{movie.year}</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                      {movie.genre}
                    </span>
                    <span className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Clock className="w-4 h-4 mr-1" />
                      {movie.runtime}
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-2 mb-3`}>
                    {movie.summary}
                  </p>
                  
                  {/* Rating and Watch Date */}
                  <div className="flex items-center space-x-4">
                    {renderStars(movie.rating, movie.id)}
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center`}>
                      <Calendar className="w-3 h-3 mr-1" />
                      Watched {new Date(movie.watchDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 ml-4">
                  <button className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400' : 'hover:bg-gray-100 text-gray-500 hover:text-blue-500'}`}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => removeFromHistory(movie.id)}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Your Film Diary
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            {filteredHistory.length} films watched • Avg rating: {
              filteredHistory.length > 0 
                ? (filteredHistory.reduce((sum, movie) => sum + movie.rating, 0) / filteredHistory.length).toFixed(1)
                : '0'
            }★
          </p>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Search and Filters */}
            <div className="flex space-x-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search films..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="date">Latest First</option>
                <option value="rating">Highest Rated</option>
                <option value="title">Alphabetical</option>
              </select>

              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4+">4+ Stars</option>
                <option value="3+">3+ Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                <List className="w-4 h-4" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredHistory.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
            <History className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              {searchTerm || filterRating !== 'all' ? 'No films match your filters' : 'No films watched yet'}
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm || filterRating !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start watching movies and they\'ll appear here with your ratings.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {viewMode === 'grid' ? <GridView /> : <ListView />}
          </div>
        )}
      </main>
    </div>
  );
};

export default WatchHistoryPage;
