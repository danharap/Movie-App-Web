import React, { useState } from 'react';
import { Users, UserPlus, Search, Star, Calendar, MessageCircle, Trash2, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const FriendsPage = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [newFriendEmail, setNewFriendEmail] = useState('');

  // Mock friends data
  const [friends, setFriends] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      avatar: null,
      status: 'online',
      moviesWatched: 45,
      avgRating: 4.2,
      lastActive: '2 hours ago',
      recentMovies: [
        { title: 'Oppenheimer', rating: 5, watchDate: '2024-01-20' },
        { title: 'Barbie', rating: 4, watchDate: '2024-01-18' }
      ]
    },
    {
      id: 2,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      avatar: null,
      status: 'offline',
      moviesWatched: 32,
      avgRating: 3.8,
      lastActive: '1 day ago',
      recentMovies: [
        { title: 'Dune', rating: 5, watchDate: '2024-01-19' },
        { title: 'Spider-Man: No Way Home', rating: 4, watchDate: '2024-01-17' }
      ]
    },
    {
      id: 3,
      name: 'Emma Davis',
      email: 'emma@example.com',
      avatar: null,
      status: 'online',
      moviesWatched: 67,
      avgRating: 4.5,
      lastActive: '30 minutes ago',
      recentMovies: [
        { title: 'Everything Everywhere All at Once', rating: 5, watchDate: '2024-01-21' },
        { title: 'The Menu', rating: 4, watchDate: '2024-01-19' }
      ]
    }
  ]);

  const [friendRequests, setFriendRequests] = useState([
    {
      id: 1,
      name: 'Alex Rodriguez',
      email: 'alex@example.com',
      mutualFriends: 2,
      requestDate: '2024-01-20'
    },
    {
      id: 2,
      name: 'Lisa Wang',
      email: 'lisa@example.com',
      mutualFriends: 1,
      requestDate: '2024-01-19'
    }
  ]);

  const handleSendFriendRequest = (e) => {
    e.preventDefault();
    if (newFriendEmail.trim()) {
      // Here you would send the friend request to your backend
      alert(`Friend request sent to ${newFriendEmail}`);
      setNewFriendEmail('');
    }
  };

  const handleAcceptRequest = (requestId) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      setFriends(prev => [...prev, {
        id: Date.now(),
        name: request.name,
        email: request.email,
        avatar: null,
        status: 'offline',
        moviesWatched: 0,
        avgRating: 0,
        lastActive: 'Just joined',
        recentMovies: []
      }]);
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const handleRejectRequest = (requestId) => {
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleRemoveFriend = (friendId) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Friends</h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Connect with friends and discover movies together.</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className={`flex ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-1 shadow-lg w-fit`}>
            {[
              { id: 'friends', label: 'My Friends', icon: Users },
              { id: 'requests', label: 'Friend Requests', icon: UserPlus },
              { id: 'add', label: 'Add Friends', icon: Search }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'requests' && friendRequests.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {friendRequests.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search friends..."
                className={`w-full pl-10 pr-4 py-3 border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>

            {/* Friends List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFriends.map(friend => (
                <div key={friend.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                        <Users className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{friend.name}</h3>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {friend.status === 'online' ? 'Online' : `Last seen ${friend.lastActive}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className={`p-2 ${isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Movies Watched</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{friend.moviesWatched}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Rating</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{friend.avgRating}/5</span>
                    </div>
                  </div>

                  {friend.recentMovies.length > 0 && (
                    <div>
                      <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Recent Activity</h4>
                      <div className="space-y-2">
                        {friend.recentMovies.slice(0, 2).map((movie, index) => (
                          <div key={index} className={`flex items-center justify-between text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded p-2`}>
                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate`}>{movie.title}</span>
                            <div className="flex items-center space-x-1 ml-2">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{movie.rating}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <MessageCircle className="w-4 h-4 inline mr-2" />
                    Message
                  </button>
                </div>
              ))}
            </div>

            {filteredFriends.length === 0 && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
                <Users className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {searchTerm ? 'No friends found' : 'No friends yet'}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {searchTerm ? 'Try a different search term.' : 'Start connecting with friends to see their movie recommendations.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Friend Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {friendRequests.map(request => (
              <div key={request.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                      <Users className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{request.name}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{request.email}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {request.mutualFriends} mutual friends • {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className={`px-4 py-2 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-lg transition-colors`}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {friendRequests.length === 0 && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
                <UserPlus className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Friend Requests</h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>You're all caught up! No pending friend requests.</p>
              </div>
            )}
          </div>
        )}

        {/* Add Friends Tab */}
        {activeTab === 'add' && (
          <div className="space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Send Friend Request</h3>
              <form onSubmit={handleSendFriendRequest} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Friend's Email
                  </label>
                  <input
                    type="email"
                    value={newFriendEmail}
                    onChange={(e) => setNewFriendEmail(e.target.value)}
                    className={`w-full px-4 py-3 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter your friend's email address"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4 inline mr-2" />
                  Send Request
                </button>
              </form>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Suggested Friends</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Based on your movie preferences and mutual connections.
              </p>
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-8 text-center`}>
                <Users className={`w-12 h-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-3`} />
                <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Friend suggestions coming soon! Connect with more friends to get personalized recommendations.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FriendsPage;
