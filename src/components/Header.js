import React from 'react';
import { Film, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Header = ({ currentPage, setCurrentPage, onLogout, user }) => {
  const { isDarkMode } = useTheme();

  return (
    <header className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 sticky top-0 z-50`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Film className="w-5 h-5 text-white" />
          </div>
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>CineMatch</h1>
        </div>        <nav className="flex items-center space-x-6">
          {['home', 'suggestions', 'history', 'friends', 'profile'].map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                currentPage === page 
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400' 
                  : `${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              {page}
            </button>
          ))}
          
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isDarkMode ? 'text-gray-300 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
            }`}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
