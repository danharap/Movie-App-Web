import React, { useState } from 'react';
import { Film, Clock, Heart } from 'lucide-react';
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
      summary: 'Paul Atreides leads nomadic tribes in a revolt against the galactic emperor who destroyed his family and controls the desert planet Arrakis.',
      rating: 0,
      saved: false
    },
    {
      id: 2,
      title: 'The French Dispatch',
      year: 2021,
      genre: 'Comedy',
      runtime: '107 min',
      summary: 'A love letter to journalists set in an outpost of an American newspaper in a fictional 20th-century French city.',
      rating: 0,
      saved: false
    },
    {
      id: 3,
      title: 'No Time to Die',
      year: 2021,
      genre: 'Action',
      runtime: '163 min',
      summary: 'James Bond has left active service when his friend Felix Leiter enlists his help to search for a missing scientist.',
      rating: 0,
      saved: false
    },
    {
      id: 4,
      title: 'Everything Everywhere All at Once',
      year: 2022,
      genre: 'Sci-Fi',
      runtime: '139 min',
      summary: 'A middle-aged Chinese immigrant is swept up in an insane adventure, where she alone can save existence.',
      rating: 0,
      saved: false
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
    setSuggestions(mockMovies.map(movie => ({ ...movie, rating: 0, saved: false })));
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Get Movie Suggestions</h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tell us what you're in the mood for, and we'll find the perfect movie.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 sticky top-24`}>
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Genres</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {genres.map(genre => (
                      <button
                        key={genre}
                        onClick={() => handleGenreToggle(genre)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedGenres.includes(genre)
                            ? 'bg-blue-600 text-white'
                            : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Mood</h3>
                  <div className="space-y-2">
                    {moods.map(mood => (
                      <button
                        key={mood}
                        onClick={() => setSelectedMood(mood)}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                          selectedMood === mood
                            ? 'bg-green-600 text-white'
                            : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Tone</h3>
                  <div className="space-y-2">
                    {tones.map(tone => (
                      <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                          selectedTone === tone
                            ? 'bg-purple-600 text-white'
                            : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Additional Notes</h3>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                    rows="3"
                    placeholder="Movies like Interstellar, or any specific preferences..."
                  />
                </div>

                <button
                  onClick={handleGetSuggestions}
                  disabled={selectedGenres.length === 0 && !selectedMood && !selectedTone}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Get Suggestions
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {suggestions.length > 0 ? (
              <div className="space-y-6">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recommended for You</h3>
                <div className="grid gap-6">
                  {suggestions.map(movie => (
                    <div key={movie.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{movie.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{movie.year}</span>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                              {movie.genre}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {movie.runtime}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => toggleSaved(movie.id)}
                            className={`p-2 transition-colors ${
                              movie.saved 
                                ? 'text-red-500 hover:text-red-600' 
                                : `${isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${movie.saved ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>{movie.summary}</p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => addToWatchHistory(movie)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark as Watched
                        </button>
                        <button 
                          onClick={() => toggleSaved(movie.id)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            movie.saved
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                              : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                          }`}
                        >
                          {movie.saved ? 'Remove from Saved' : 'Save for Later'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
