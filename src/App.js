import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import WatchHistoryPage from './components/WatchHistoryPage';
import SuggestionsPage from './components/SuggestionsPage';
import FriendsPage from './components/FriendsPage';
import ProfilePage from './components/ProfilePage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Movie management state
  const [suggestions, setSuggestions] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
    // Load saved data from localStorage on app start
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('movieapp_user');
      const savedWatchHistory = localStorage.getItem('movieapp_watchhistory');
      const savedMoviesData = localStorage.getItem('movieapp_savedmovies');
      
      if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        setCurrentPage('home');
      }
      
      if (savedWatchHistory && savedWatchHistory !== 'undefined' && savedWatchHistory !== 'null') {
        setWatchHistory(JSON.parse(savedWatchHistory));
      }
      
      if (savedMoviesData && savedMoviesData !== 'undefined' && savedMoviesData !== 'null') {
        setSavedMovies(JSON.parse(savedMoviesData));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('movieapp_user');
      localStorage.removeItem('movieapp_watchhistory');
      localStorage.removeItem('movieapp_savedmovies');
    }
  }, []);
    // Save data to localStorage when it changes
  useEffect(() => {
    if (watchHistory && watchHistory.length > 0) {
      try {
        localStorage.setItem('movieapp_watchhistory', JSON.stringify(watchHistory));
      } catch (error) {
        console.error('Error saving watch history to localStorage:', error);
      }
    }
  }, [watchHistory]);
  
  useEffect(() => {
    if (savedMovies && savedMovies.length > 0) {
      try {
        localStorage.setItem('movieapp_savedmovies', JSON.stringify(savedMovies));
      } catch (error) {
        console.error('Error saving movies to localStorage:', error);
      }
    }
  }, [savedMovies]);
  const handleLogin = (userData) => {
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
      setCurrentPage('home');
      try {
        localStorage.setItem('movieapp_user', JSON.stringify(userData));
      } catch (error) {
        console.error('Error saving user data to localStorage:', error);
      }
    }
  };
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
    try {
      localStorage.removeItem('movieapp_user');
    } catch (error) {
      console.error('Error removing user data from localStorage:', error);
    }
  };
  // Utility function to clear all app data (useful for debugging)
  const clearAllData = () => {
    try {
      localStorage.removeItem('movieapp_user');
      localStorage.removeItem('movieapp_watchhistory');
      localStorage.removeItem('movieapp_savedmovies');
      setUser(null);
      setIsAuthenticated(false);
      setWatchHistory([]);
      setSavedMovies([]);
      setSuggestions([]);
      setCurrentPage('login');
    } catch (error) {
      console.error('Error clearing app data:', error);
    }
  };
  
  // Make clearAllData available in development for debugging
  if (process.env.NODE_ENV === 'development') {
    window.clearAllData = clearAllData;
  }
  
  const addToWatchHistory = (movie) => {
    const newEntry = {
      ...movie,
      id: Date.now(),
      watchDate: new Date().toISOString().split('T')[0],
      rating: 0
    };
    setWatchHistory(prev => [newEntry, ...prev]);
    
    // Remove from suggestions
    setSuggestions(prev => prev.filter(m => m.id !== movie.id));
  };

  const updateRating = (id, rating) => {
    setWatchHistory(prev => 
      prev.map(movie => 
        movie.id === id ? { ...movie, rating } : movie
      )
    );
  };

  const removeFromHistory = (id) => {
    setWatchHistory(prev => prev.filter(movie => movie.id !== id));
  };

  const toggleSaved = (movieId) => {
    setSuggestions(prev => 
      prev.map(movie => 
        movie.id === movieId 
          ? { ...movie, saved: !movie.saved }
          : movie
      )
    );
    
    const movie = suggestions.find(m => m.id === movieId);
    if (movie) {
      if (!movie.saved) {
        setSavedMovies(prev => [...prev, { ...movie, saved: true }]);
      } else {
        setSavedMovies(prev => prev.filter(m => m.id !== movieId));
      }
    }
  };
  const updateUser = (updatedUserData) => {
    if (updatedUserData) {
      setUser(updatedUserData);
      try {
        localStorage.setItem('movieapp_user', JSON.stringify(updatedUserData));
      } catch (error) {
        console.error('Error updating user data in localStorage:', error);
      }
    }
  };

  // Render authentication page if not logged in
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <AuthPage onLogin={handleLogin} />
        </div>
      </ThemeProvider>
    );
  }

  // Render main application if authenticated
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          onLogout={handleLogout}
          user={user}
        />
        
        <main>
          {currentPage === 'home' && (
            <HomePage 
              user={user}
              setCurrentPage={setCurrentPage}
              watchHistory={watchHistory}
              savedMovies={savedMovies}
            />
          )}
          
          {currentPage === 'suggestions' && (
            <SuggestionsPage 
              suggestions={suggestions}
              setSuggestions={setSuggestions}
              addToWatchHistory={addToWatchHistory}
              toggleSaved={toggleSaved}
            />
          )}
          
          {currentPage === 'history' && (
            <WatchHistoryPage 
              watchHistory={watchHistory}
              updateRating={updateRating}
              removeFromHistory={removeFromHistory}
            />
          )}
          
          {currentPage === 'friends' && (
            <FriendsPage />
          )}
          
          {currentPage === 'profile' && (
            <ProfilePage 
              user={user}
              updateUser={updateUser}
              onLogout={handleLogout}
              setCurrentPage={setCurrentPage}
              watchHistory={watchHistory}
              savedMovies={savedMovies}
            />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
};
export default App;
