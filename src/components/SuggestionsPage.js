import React, { useState } from 'react';
import { Film, Clock, Heart, Star, Play, Bookmark, Grid, List, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SuggestionsPage = ({ 
  suggestions, 
  setSuggestions, 
  addToWatchHistory, 
  toggleSaved 
}) => {
  const { isDarkMode } = useTheme();
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedTone, setSelectedTone] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('match'); // 'match', 'rating', 'year', 'title'
  const [searchTerm, setSearchTerm] = useState('');

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary', 'Animation', 'Adventure'];
  const moods = ['Happy', 'Sad', 'Excited', 'Relaxed', 'Adventurous', 'Nostalgic'];
  const tones = ['Light & Fun', 'Dark & Serious', 'Inspirational', 'Mysterious', 'Romantic', 'Mind-bending'];
  const mockMovies = [
    {
      id: 1,
      title: 'Dune',
      year: 2021,
      genre: 'Sci-Fi',
      runtime: '155 min',
      director: 'Denis Villeneuve',
      summary: 'Paul Atreides leads nomadic tribes in a revolt against the galactic emperor who destroyed his family and controls the desert planet Arrakis.',
      poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/eopBX35vIzZca52VjnjkOS8cCGL.jpg',
      rating: 0,
      saved: false,
      tmdbRating: 8.0,
      matchScore: 92
    },
    {
      id: 2,
      title: 'The French Dispatch',
      year: 2021,
      genre: 'Comedy',
      runtime: '107 min',
      director: 'Wes Anderson',
      summary: 'A love letter to journalists set in an outpost of an American newspaper in a fictional 20th-century French city.',
      poster: 'https://image.tmdb.org/t/p/w500/6V2sUdyIqOFd6iZo9ng2dYXlqCu.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/cw3nYVWdbvgzAHWnDaZUDhBK4Px.jpg',
      rating: 0,
      saved: false,
      tmdbRating: 7.1,
      matchScore: 89
    },
    {
      id: 3,
      title: 'No Time to Die',
      year: 2021,
      genre: 'Action',
      runtime: '163 min',
      director: 'Cary Joji Fukunaga',
      summary: 'James Bond has left active service when his friend Felix Leiter enlists his help to search for a missing scientist.',
      poster: 'https://image.tmdb.org/t/p/w500/iUgygt3fscRoKWCV1d0C7FbM9TP.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/akJQpZp80hKKkLdGE5g5vNvQdgb.jpg',
      rating: 0,
      saved: false,
      tmdbRating: 7.3,
      matchScore: 85
    },
    {
      id: 4,
      title: 'Everything Everywhere All at Once',
      year: 2022,
      genre: 'Sci-Fi',
      runtime: '139 min',
      director: 'Daniels',
      summary: 'A middle-aged Chinese immigrant is swept up in an insane adventure, where she alone can save existence.',
      poster: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/xDMIl84Qo5Tsu62c9DGWhmPI67A.jpg',
      rating: 0,
      saved: false,
      tmdbRating: 7.8,
      matchScore: 96
    },
    {
      id: 5,
      title: 'The Grand Budapest Hotel',
      year: 2014,
      genre: 'Comedy',
      runtime: '99 min',
      director: 'Wes Anderson',
      summary: 'A legendary concierge at a famous European hotel between the wars and his protégé become friends and then later flee together.',
      poster: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/nX5XotM9yprCKarRH4fzOq1VM1J.jpg',
      rating: 0,
      saved: false,
      tmdbRating: 8.1,
      matchScore: 88
    },
    {
      id: 6,
      title: 'Blade Runner 2049',
      year: 2017,
      genre: 'Sci-Fi',
      runtime: '164 min',
      director: 'Denis Villeneuve',
      summary: 'Young Blade Runner K discovers a long-buried secret that leads him to track down former Blade Runner Rick Deckard.',
      poster: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/ilKaClbzSWKcqhAVcgbJ9nGElxg.jpg',
      rating: 0,
      saved: false,
      tmdbRating: 8.0,
      matchScore: 94
    }
  ];

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };
  const handleGetSuggestions = () => {
    // Simulate API response with enhanced movie data
    const enhancedMovies = mockMovies.map(movie => ({
      ...movie,
      rating: 0,
      saved: false,
      // Randomly adjust match scores based on selected preferences
      matchScore: Math.max(60, Math.min(99, movie.matchScore + Math.floor(Math.random() * 10) - 5))
    }));
    
    setSuggestions(enhancedMovies);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <main className="max-w-7xl mx-auto px-6 py-8">        <div className="mb-8">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Get Movie Suggestions</h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Tell us what you're in the mood for, and we'll find the perfect movie.</p>
          
          {/* Call to Action */}
          <div className={`${isDarkMode ? 'bg-gradient-to-r from-blue-900/30 to-green-900/30 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-green-50 border-blue-200'} border rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Ready to Mark Movies as Watched?
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Click "Mark as Watched" on any movie below to add it to your watch history with ratings and notes.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'} border`}>
                  Hover over posters
                </div>
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>or</span>
                <div className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'} border`}>
                  Use list view
                </div>
              </div>
            </div>
          </div>
        </div><div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 sticky top-24`}>
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Find Your Perfect Movie
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Customize your preferences below
                  </p>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center`}>
                    <Film className="w-5 h-5 mr-2 text-blue-500" />
                    Genres
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {genres.map(genre => (
                      <button
                        key={genre}
                        onClick={() => handleGenreToggle(genre)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedGenres.includes(genre)
                            ? 'bg-blue-600 text-white shadow-md transform scale-105'
                            : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} hover:shadow-md`
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  {selectedGenres.length > 0 && (
                    <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {selectedGenres.length} genre{selectedGenres.length > 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>

                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center`}>
                    <Heart className="w-5 h-5 mr-2 text-pink-500" />
                    Mood
                  </h3>
                  <div className="space-y-2">
                    {moods.map(mood => (
                      <button
                        key={mood}
                        onClick={() => setSelectedMood(mood)}
                        className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                          selectedMood === mood
                            ? 'bg-green-600 text-white shadow-md transform scale-102'
                            : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} hover:shadow-md`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{mood}</span>
                          {selectedMood === mood && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center`}>
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Tone
                  </h3>
                  <div className="space-y-2">
                    {tones.map(tone => (
                      <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                          selectedTone === tone
                            ? 'bg-purple-600 text-white shadow-md transform scale-102'
                            : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} hover:shadow-md`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{tone}</span>
                          {selectedTone === tone && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Additional Notes</h3>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200`}
                    rows="4"
                    placeholder="Movies like Interstellar, directors you love, specific themes, or any other preferences..."
                  />
                </div>

                <button
                  onClick={handleGetSuggestions}
                  disabled={selectedGenres.length === 0 && !selectedMood && !selectedTone}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  ✨ Get Suggestions
                </button>
              </div>
            </div>
          </div><div className="lg:col-span-2">
            {suggestions.length > 0 ? (
              <div className="space-y-6">
                {/* Header with view controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Recommended for You
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {suggestions.length} movies found
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="text"
                        placeholder="Search movies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`pl-10 pr-4 py-2 border rounded-lg text-sm w-48 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>

                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`px-3 py-2 border rounded-lg text-sm ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="match">Best Match</option>
                      <option value="rating">Rating</option>
                      <option value="year">Year</option>
                      <option value="title">Title</option>
                    </select>

                    {/* View toggle */}
                    <div className={`flex rounded-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-l-lg transition-colors ${
                          viewMode === 'grid'
                            ? 'bg-blue-600 text-white'
                            : `${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-r-lg transition-colors ${
                          viewMode === 'list'
                            ? 'bg-blue-600 text-white'
                            : `${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Movie Grid/List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {suggestions
                      .filter(movie => movie.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .sort((a, b) => {
                        switch (sortBy) {
                          case 'rating': return b.tmdbRating - a.tmdbRating;
                          case 'year': return b.year - a.year;
                          case 'title': return a.title.localeCompare(b.title);
                          case 'match':
                          default: return b.matchScore - a.matchScore;
                        }
                      })
                      .map(movie => (
                        <div key={movie.id} className="group relative">
                          {/* Poster Card */}
                          <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                            <img
                              src={movie.poster}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = `https://via.placeholder.com/300x450/374151/ffffff?text=${encodeURIComponent(movie.title)}`;
                              }}
                            />
                              {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="text-center space-y-3">
                                <button
                                  onClick={() => addToWatchHistory(movie)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto font-semibold text-sm shadow-lg transform hover:scale-105"
                                >
                                  <Play className="w-5 h-5" />
                                  Mark as Watched
                                </button>
                                <button
                                  onClick={() => toggleSaved(movie.id)}
                                  className={`${
                                    movie.saved 
                                      ? 'bg-red-600 hover:bg-red-700' 
                                      : 'bg-blue-600 hover:bg-blue-700'
                                  } text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto font-semibold text-sm shadow-lg transform hover:scale-105`}
                                >
                                  {movie.saved ? <Heart className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                                  {movie.saved ? 'Remove from Saved' : 'Save for Later'}
                                </button>
                              </div>
                            </div>

                            {/* Match score badge */}
                            <div className="absolute top-2 left-2">
                              <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {movie.matchScore}% match
                              </span>
                            </div>

                            {/* Rating badge */}
                            <div className="absolute top-2 right-2">
                              <div className="flex items-center bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                                <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                                {movie.tmdbRating}
                              </div>
                            </div>
                          </div>

                          {/* Movie info */}
                          <div className="mt-3 space-y-1">
                            <h4 className={`font-medium text-sm line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {movie.title}
                            </h4>
                            <div className="flex items-center justify-between text-xs">
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                {movie.year}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                {movie.genre}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  /* List View */
                  <div className="space-y-4">
                    {suggestions
                      .filter(movie => movie.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .sort((a, b) => {
                        switch (sortBy) {
                          case 'rating': return b.tmdbRating - a.tmdbRating;
                          case 'year': return b.year - a.year;
                          case 'title': return a.title.localeCompare(b.title);
                          case 'match':
                          default: return b.matchScore - a.matchScore;
                        }
                      })
                      .map(movie => (
                        <div key={movie.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300`}>
                          <div className="flex gap-6">
                            {/* Poster */}
                            <div className="flex-shrink-0">
                              <div className="w-24 h-36 rounded-lg overflow-hidden shadow-md">
                                <img
                                  src={movie.poster}
                                  alt={movie.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = `https://via.placeholder.com/150x225/374151/ffffff?text=${encodeURIComponent(movie.title)}`;
                                  }}
                                />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    {movie.title}
                                  </h4>
                                  <div className="flex items-center space-x-4 text-sm mb-3">
                                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                      {movie.year}
                                    </span>
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                                      {movie.genre}
                                    </span>
                                    <span className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      <Clock className="w-4 h-4 mr-1" />
                                      {movie.runtime}
                                    </span>
                                    <span className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      <Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
                                      {movie.tmdbRating}
                                    </span>
                                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                      {movie.matchScore}% match
                                    </span>
                                  </div>
                                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                                    Directed by {movie.director}
                                  </p>
                                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-3`}>
                                    {movie.summary}
                                  </p>
                                </div>
                              </div>                              {/* Actions */}
                              <div className="flex items-center gap-4 pt-4">
                                <button
                                  onClick={() => addToWatchHistory(movie)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg transform hover:scale-105"
                                >
                                  <Play className="w-5 h-5" />
                                  Mark as Watched
                                </button>
                                <button
                                  onClick={() => toggleSaved(movie.id)}
                                  className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg transform hover:scale-105 ${
                                    movie.saved
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                      : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                                  }`}
                                >
                                  {movie.saved ? (
                                    <>
                                      <Heart className="w-5 h-5 fill-current" />
                                      Remove from Saved
                                    </>
                                  ) : (
                                    <>
                                      <Bookmark className="w-5 h-5" />
                                      Save for Later
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
                <Film className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Ready for Suggestions?</h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select your preferences and click "Get Suggestions" to discover your next favorite movie.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuggestionsPage;
