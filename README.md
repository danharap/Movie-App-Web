# CineMatch - Movie Suggestion Web App

A modern, responsive movie suggestion web application built with React and Tailwind CSS. CineMatch helps users discover their next favorite movie based on their preferences, mood, and viewing history.

## 🎬 Features

### Authentication
- Email/password login and signup
- Session persistence
- Form validation and error handling

### Home Dashboard
- Personalized greeting
- Quick navigation to main features
- User statistics display

### Movie Suggestions
- Multi-select genre preferences
- Mood selector (Happy, Sad, Excited, etc.)
- Tone selector (Light & Fun, Dark & Serious, etc.)
- Custom input for specific requests
- AI-powered recommendations (ready for OpenAI API integration)

### Watch History
- Track watched movies with ratings
- Date tracking for viewing history
- Edit and remove entries
- Star rating system (1-5 stars)

### User Profile
- Account management (username, email, password)
- Profile picture upload
- User preferences and settings
- Quick stats and actions
- Social features placeholder

## 🚀 Tech Stack

- **Frontend**: React 18, Tailwind CSS
- **Icons**: Lucide React
- **Backend Ready**: Designed for FastAPI integration
- **Database Ready**: PostgreSQL schema-ready
- **Authentication Ready**: Firebase Auth or Auth0 integration
- **AI Ready**: OpenAI API integration ready

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MovieAppWeb
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🎨 Design Features

- **Modern UI**: Clean, professional design with smooth animations
- **Responsive**: Desktop-first design that works on all screen sizes
- **Interactive**: Hover effects, transitions, and micro-interactions
- **Accessible**: Focus states and keyboard navigation
- **Consistent**: Unified color scheme and typography

## 🔧 Customization

### Color Scheme
The app uses a blue primary color scheme that can be easily customized in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  }
}
```

### Adding New Features
The app is structured with clear separation of concerns:
- State management in main `App.js`
- Reusable components pattern
- Easy to extend with new pages

## 🚀 Deployment

Build the app for production:
```bash
npm run build
```

The build folder will contain the optimized production files ready for deployment.

## 🔮 Future Enhancements

- [ ] Backend API integration (FastAPI)
- [ ] Database integration (PostgreSQL)
- [ ] Real authentication (Firebase/Auth0)
- [ ] OpenAI API for smart suggestions
- [ ] Social features (friends, sharing)
- [ ] Advanced filtering and search
- [ ] Movie trailers and images
- [ ] Watchlist functionality
- [ ] Mobile app version

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
