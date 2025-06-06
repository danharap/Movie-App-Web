import React, { useState, useEffect, useRef } from 'react';
import { Search, History, User, Plus, Film, X, Star, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const HomePage = ({ user, setCurrentPage, watchHistory, savedMovies, addToWatchHistory }) => {
  const { isDarkMode } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  
  // Refs for scroll animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const quickAddRef = useRef(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '-50px' }
    );

    const refs = [heroRef, featuresRef, statsRef, quickAddRef];
    refs.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      refs.forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  // Throttle scroll events for better performance
  const throttle = (func, delay) => {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  };

  // Enhanced scroll handling with parallax effect
  useEffect(() => {
    const handleScroll = throttle(() => {
      const scrolled = window.pageYOffset;
      const heroElement = heroRef.current;
      
      if (heroElement) {
        // Subtle parallax effect
        const parallaxOffset = scrolled * 0.2;
        heroElement.style.transform = `translateY(${parallaxOffset}px)`;
      }
    }, 16);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mock movie database for searching
  const mockMovieDatabase = [
    {
      id: 'search-1',
      title: 'The Shawshank Redemption',
      year: 1994,
      genre: 'Drama',
      director: 'Frank Darabont',
      poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      tmdbRating: 9.3,
      summary: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      rating: 0
    },
    {
      id: 'search-2',
      title: 'The Godfather',
      year: 1972,
      genre: 'Crime',
      director: 'Francis Ford Coppola',
      poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      tmdbRating: 9.2,
      summary: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      rating: 0
    },
    {
      id: 'search-3',
      title: 'The Dark Knight',
      year: 2008,
      genre: 'Action',
      director: 'Christopher Nolan',
      poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      tmdbRating: 9.0,
      summary: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
      rating: 0
    },
    {
      id: 'search-4',
      title: 'Pulp Fiction',
      year: 1994,
      genre: 'Crime',
      director: 'Quentin Tarantino',
      poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      tmdbRating: 8.9,
      summary: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
      rating: 0
    },
    {
      id: 'search-5',
      title: 'Forrest Gump',
      year: 1994,
      genre: 'Drama',
      director: 'Robert Zemeckis',
      poster: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
      tmdbRating: 8.8,
      summary: 'The presidencies of Kennedy and Johnson, Vietnam, Watergate, and other history unfold through the perspective of an Alabama man.',
      rating: 0
    },
    {
      id: 'search-6',
      title: 'Inception',
      year: 2010,
      genre: 'Sci-Fi',
      director: 'Christopher Nolan',
      poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      tmdbRating: 8.8,
      summary: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
      rating: 0
    },
    {
      id: 'search-7',
      title: 'The Matrix',
      year: 1999,
      genre: 'Sci-Fi',
      director: 'The Wachowskis',
      poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      tmdbRating: 8.7,
      summary: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
      rating: 0
    },
    {
      id: 'search-8',
      title: 'Goodfellas',
      year: 1990,
      genre: 'Crime',
      director: 'Martin Scorsese',
      poster: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
      tmdbRating: 8.7,
      summary: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.',
      rating: 0
    }
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    // Simulate API call delay
    setTimeout(() => {
      const filtered = mockMovieDatabase.filter(movie =>
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        movie.director.toLowerCase().includes(query.toLowerCase()) ||
        movie.genre.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  const handleAddMovie = (movie) => {
    addToWatchHistory(movie);
    setShowAddModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Popular movies for quick adding
  const popularMovies = [
    {
      id: 'quick-1',
      title: 'Oppenheimer',
      year: 2023,
      genre: 'Biography',
      poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      rating: 0
    },
    {
      id: 'quick-2', 
      title: 'Barbie',
      year: 2023,
      genre: 'Comedy',
      poster: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
      rating: 0
    },
    {
      id: 'quick-3',
      title: 'Dune: Part Two',
      year: 2024,
      genre: 'Sci-Fi',
      poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      rating: 0
    },
    {
      id: 'quick-4',
      title: 'Spider-Man: No Way Home',
      year: 2021,
      genre: 'Action',
      poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
      rating: 0
    }
  ];

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
        {/* Hero Section */}
        <div 
          ref={heroRef}
          id="hero"
          className={`text-center mb-16 transition-all duration-1000 ${
            visibleSections.has('hero') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}        >
          <div className="relative floating-particles">
            <h2 className={`text-5xl md:text-6xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 leading-tight`}>
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {user.name}
              </span>
              !
            </h2>
            <div className="absolute -top-2 -right-2 opacity-20">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
            <div className="absolute top-1/2 -left-4 opacity-10">
              <Sparkles className="w-6 h-6 text-blue-400 animate-bounce" style={{ animationDelay: '1s' }} />
            </div>
            <div className="absolute -bottom-2 left-1/4 opacity-15">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
          </div>
          <p className={`text-xl md:text-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto leading-relaxed shimmer-text`}>
            Ready to discover your next favorite movie?
          </p>
        </div>{/* Features Section */}
        <div 
          ref={featuresRef}
          id="features"
          className={`grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20 transition-all duration-1000 delay-200 ${
            visibleSections.has('features') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
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
                return 'bg-gray-700 group-hover:bg-gray-650';
              } else {
                return 'bg-gray-50 group-hover:bg-gray-100';
              }
            };return (
              <div
                key={index}
                onClick={() => setCurrentPage(feature.page)}
                className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white'} rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group magnetic-card micro-bounce ${visibleSections.has('features') ? 'scale-in' : ''}`}
                style={{
                  animationDelay: visibleSections.has('features') ? `${index * 100}ms` : '0ms'
                }}
              >
                <div className={`w-16 h-16 ${getBgColor(feature.color)} rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 btn-ripple`}>
                  <Icon className={`w-8 h-8 ${getIconColor(feature.color)} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`} />
                </div>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3 transition-colors duration-300`}>
                  {feature.title}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>        {/* Quick Stats */}
        <div 
          ref={statsRef}
          id="stats"
          className={`grid md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-20 transition-all duration-1000 delay-400 ${
            visibleSections.has('stats') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
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
              <div 
                key={index} 
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 micro-bounce magnetic-card ${visibleSections.has('stats') ? 'bounce-elastic' : ''}`}
                style={{
                  animationDelay: visibleSections.has('stats') ? `${index * 150}ms` : '0ms'
                }}
              >
                <div className={`text-3xl font-bold ${getStatColor(stat.color)} mb-2 transition-all duration-300 hover:scale-110`}>
                  {stat.value}
                </div>
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>        {/* Quick Add to Watch History */}
        <div 
          ref={quickAddRef}
          id="quickAdd"
          className={`max-w-4xl mx-auto transition-all duration-1000 delay-600 ${
            visibleSections.has('quickAdd') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div className="text-center lg:text-left">
              <h3 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Add to Watch History
              </h3>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Add movies you've already watched - popular picks or search for any movie
              </p>
            </div>            <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
              <button
                onClick={() => setShowAddModal(true)}
                className="group relative bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-semibold shadow-md hover:shadow-lg"
              >
                <Search className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
                <span>Search & Add Movie</span>
              </button>
              <button
                onClick={() => setCurrentPage('suggestions')}
                className="group bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-semibold shadow-md hover:shadow-lg"
              >
                <Sparkles className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" />
                Find Suggestions
              </button>
            </div>
          </div>          {/* Popular Movies Quick Add */}
          <div className="mb-6">
            <h4 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 text-center lg:text-left`}>
              Popular Movies
            </h4>            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {popularMovies.map((movie, index) => (
                <div 
                  key={movie.id} 
                  className={`group relative movie-card-3d micro-bounce ${visibleSections.has('quickAdd') ? 'scale-in' : ''} grid-stagger-${index + 1}`}
                  style={{
                    animationDelay: visibleSections.has('quickAdd') ? `${index * 100 + 200}ms` : '0ms'
                  }}
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/300x450/374151/ffffff?text=${encodeURIComponent(movie.title)}`;
                      }}
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => addToWatchHistory(movie)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 font-semibold shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        Add to History
                      </button>
                    </div>

                    {/* Floating badge */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {movie.year}
                      </div>
                    </div>
                  </div>
                  
                  {/* Movie info */}
                  <div className="mt-4 space-y-2">
                    <h4 className={`font-semibold text-sm line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                      {movie.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
                        {movie.year}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${isDarkMode ? 'bg-gray-700 text-gray-300 group-hover:bg-blue-600 group-hover:text-white' : 'bg-gray-200 text-gray-700 group-hover:bg-blue-600 group-hover:text-white'}`}>
                        {movie.genre}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>        {/* Search Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 animate-slideUp`}>
              {/* Modal Header */}
              <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-6 bg-gradient-to-r ${isDarkMode ? 'from-gray-800 to-gray-700' : 'from-gray-50 to-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
                      <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                      Add Movie to Watch History
                    </h3>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                      Search for any movie you've watched and add it to your collection
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Enhanced Search Bar */}
                <div className="relative mt-6">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for movies by title, director, or genre..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 border-2 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500' : 'border-gray-300 focus:border-green-500'} rounded-xl focus:ring-4 focus:ring-green-500/20 focus:outline-none transition-all duration-200 text-lg`}
                    autoFocus
                  />
                  {searchQuery && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className={`p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>              {/* Search Results */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-green-200 opacity-25"></div>
                    </div>
                    <p className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Searching for movies...
                    </p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                      Found {searchResults.length} movie{searchResults.length !== 1 ? 's' : ''}
                    </div>
                    {searchResults.map((movie, index) => (
                      <div 
                        key={movie.id} 
                        className={`${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                        style={{
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        <div className="flex gap-4">
                          {/* Poster */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-24 rounded-lg overflow-hidden shadow-md">
                              <img
                                src={movie.poster}
                                alt={movie.title}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                onError={(e) => {
                                  e.target.src = `https://via.placeholder.com/100x150/374151/ffffff?text=${encodeURIComponent(movie.title)}`;
                                }}
                              />
                            </div>
                          </div>

                          {/* Movie Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {movie.title}
                                </h4>
                                <div className="flex items-center gap-3 text-sm mt-2">
                                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
                                    {movie.year}
                                  </span>
                                  <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-semibold">
                                    {movie.genre}
                                  </span>
                                  <span className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                                    <span className="font-semibold">{movie.tmdbRating}</span>
                                  </span>
                                </div>
                                <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Directed by {movie.director}
                                </p>
                                <p className={`text-sm mt-2 line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {movie.summary}
                                </p>
                              </div>                              <button
                                onClick={() => handleAddMovie(movie)}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 ml-4 font-semibold shadow-md hover:shadow-lg"
                              >
                                <Plus className="w-5 h-5" />
                                Add to History
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim() !== '' ? (
                  <div className="text-center py-8">
                    <Film className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-3`} />
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No movies found for "{searchQuery}"
                    </p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Try searching by title, director, or genre
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-3`} />
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Start typing to search for movies
                    </p>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Search by title, director, or genre
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}        {/* Floating Action Button */}
        <button
          onClick={() => setCurrentPage('suggestions')}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
          title="Get Movie Suggestions"
        >
          <Film className="w-6 h-6 transition-transform duration-200 group-hover:scale-105" />
        </button>
      </main>
    </div>
  );
};

export default HomePage;
