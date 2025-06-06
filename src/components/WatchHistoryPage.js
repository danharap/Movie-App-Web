import React from 'react';
import { Star, Clock, Calendar, Edit, Trash2, History } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const WatchHistoryPage = ({ watchHistory, updateRating, removeFromHistory }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Watch History</h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Movies you've watched and rated.</p>
        </div>

        <div className="space-y-6">
          {watchHistory.map(movie => (
            <div key={movie.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{movie.title}</h3>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => updateRating(movie.id, star)}
                          className={`w-5 h-5 ${
                            star <= movie.rating ? 'text-yellow-400' : isDarkMode ? 'text-gray-600' : 'text-gray-300'
                          } hover:text-yellow-400 transition-colors`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                      {movie.rating > 0 && (
                        <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>({movie.rating}/5)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span>{movie.year}</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                      {movie.genre}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {movie.runtime}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Watched {new Date(movie.watchDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{movie.summary}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button className={`p-2 ${isDarkMode ? 'text-gray-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'} transition-colors`}>
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => removeFromHistory(movie.id)}
                    className={`p-2 ${isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {watchHistory.length === 0 && (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
              <History className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Watch History Yet</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Start watching movies and they'll appear here with your ratings.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WatchHistoryPage;
