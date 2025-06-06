import React from 'react';
import { Search, History, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const HomePage = ({ user, setCurrentPage, watchHistory, savedMovies }) => {
  const { isDarkMode } = useTheme();

  const stats = [
    {
      label: 'Movies Watched',
      value: watchHistory.length,
      color: 'blue'
    },
    {
      label: 'Saved Movies',
      value: savedMovies.length,
      color: 'green'
    },
    {
      label: 'Avg Rating',
      value: watchHistory.length > 0 
        ? (watchHistory.reduce((sum, movie) => sum + movie.rating, 0) / watchHistory.length).toFixed(1)
        : '0.0',
      color: 'purple'
    }
  ];

  const features = [
    {
      icon: Search,
      title: 'Get Movie Suggestions',
      description: 'Tell us your mood and preferences, and we\'ll find the perfect movie for you.',
      color: 'blue',
      page: 'suggestions'
    },
    {
      icon: History,
      title: 'View Watch History',
      description: 'Browse movies you\'ve watched and see your ratings and notes.',
      color: 'green',
      page: 'history'
    },
    {
      icon: User,
      title: 'Go to Profile',
      description: 'Manage your account settings and connect with friends.',
      color: 'purple',
      page: 'profile'
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Welcome back, {user.name}!
          </h2>
          <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Ready to discover your next favorite movie?
          </p>
        </div>        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const getIconColor = (color) => {
              if (isDarkMode) {
                return 'text-white';
              }
              switch (color) {
                case 'blue': return 'text-blue-600';
                case 'green': return 'text-green-600';
                case 'purple': return 'text-purple-600';
                default: return 'text-gray-600';
              }
            };
            
            const getBgColor = (color) => {
              if (isDarkMode) {
                switch (color) {
                  case 'blue': return 'bg-blue-900/30 group-hover:bg-blue-900/40';
                  case 'green': return 'bg-green-900/30 group-hover:bg-green-900/40';
                  case 'purple': return 'bg-purple-900/30 group-hover:bg-purple-900/40';
                  default: return 'bg-gray-700 group-hover:bg-gray-600';
                }
              } else {
                switch (color) {
                  case 'blue': return 'bg-blue-100 group-hover:bg-blue-200';
                  case 'green': return 'bg-green-100 group-hover:bg-green-200';
                  case 'purple': return 'bg-purple-100 group-hover:bg-purple-200';
                  default: return 'bg-gray-100 group-hover:bg-gray-200';
                }
              }
            };

            return (
              <div
                key={index}
                onClick={() => setCurrentPage(feature.page)}
                className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white'} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer group transform hover:-translate-y-1`}
              >
                <div className={`w-16 h-16 ${getBgColor(feature.color)} rounded-xl flex items-center justify-center mb-6 transition-colors`}>
                  <Icon className={`w-8 h-8 ${getIconColor(feature.color)}`} />
                </div>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
                  {feature.title}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>        {/* Quick Stats */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {stats.map((stat, index) => {
            const getStatColor = (color) => {
              if (isDarkMode) {
                switch (color) {
                  case 'blue': return 'text-blue-400';
                  case 'green': return 'text-green-400';
                  case 'purple': return 'text-purple-400';
                  default: return 'text-gray-400';
                }
              } else {
                switch (color) {
                  case 'blue': return 'text-blue-600';
                  case 'green': return 'text-green-600';
                  case 'purple': return 'text-purple-600';
                  default: return 'text-gray-600';
                }
              }
            };
            
            return (
              <div key={index} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 text-center shadow-lg`}>
                <div className={`text-2xl font-bold ${getStatColor(stat.color)}`}>{stat.value}</div>
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
