import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Star, Heart, Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const AnimationTestPage = () => {
  const { isDarkMode } = useTheme();
  const [animationStage, setAnimationStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [performance, setPerformance] = useState({ fps: 0, memory: 0 });
  const frameRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const framesRef = useRef(0);

  // Performance monitoring
  useEffect(() => {
    const measurePerformance = () => {
      const now = performance.now();
      framesRef.current++;
      
      if (now >= lastTimeRef.current + 1000) {
        setPerformance(prev => ({
          fps: Math.round((framesRef.current * 1000) / (now - lastTimeRef.current)),
          memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 0
        }));
        
        framesRef.current = 0;
        lastTimeRef.current = now;
      }
      
      if (isPlaying) {
        frameRef.current = requestAnimationFrame(measurePerformance);
      }
    };

    if (isPlaying) {
      frameRef.current = requestAnimationFrame(measurePerformance);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isPlaying]);

  // Animation cycle
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setAnimationStage(prev => (prev + 1) % 8);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const testAnimations = [
    { name: 'Scale In', class: 'scale-in' },
    { name: 'Slide Up', class: 'animate-slideUp' },
    { name: 'Slide Left', class: 'animate-slideInLeft' },
    { name: 'Slide Right', class: 'animate-slideInRight' },
    { name: 'Bounce Elastic', class: 'bounce-elastic' },
    { name: 'Float', class: 'animate-float' },
    { name: 'Shimmer', class: 'animate-shimmer' },
    { name: 'Magnetic Card', class: 'magnetic-card' }
  ];

  const handleTogglePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  const handleReset = () => {
    setAnimationStage(0);
    setIsPlaying(true);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 gradient-text`}>
            Animation Test Suite
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            Testing all enhanced animations and performance
          </p>
          
          {/* Performance Monitor */}
          <div className={`inline-flex items-center gap-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl px-6 py-3 shadow-lg`}>
            <div className="text-sm">
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>FPS: </span>
              <span className={`font-bold ${performance.fps >= 55 ? 'text-green-500' : performance.fps >= 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                {performance.fps}
              </span>
            </div>
            <div className="text-sm">
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Memory: </span>
              <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {performance.memory}MB
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleTogglePlayback}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 micro-bounce ${
                isPlaying 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300 micro-bounce"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>

        {/* Animation Test Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {testAnimations.map((animation, index) => (
            <div 
              key={animation.name}
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg text-center ${
                animationStage === index ? animation.class : ''
              } ${animationStage === index ? 'glow' : ''}`}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center ${
                animationStage === index ? 'animate-pulse' : ''
              }`}>
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                {animation.name}
              </h3>
              <div className={`text-sm px-3 py-1 rounded-full inline-block ${
                animationStage === index 
                  ? 'bg-green-600 text-white' 
                  : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
              }`}>
                {animationStage === index ? 'Active' : 'Waiting'}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Elements Test */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg mb-12`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 text-center`}>
            Interactive Elements Test
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Magnetic Card */}
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl p-6 magnetic-card cursor-pointer`}>
              <Heart className="w-8 h-8 mb-3 text-red-500" />
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Magnetic Card
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Hover for 3D effect
              </p>
            </div>

            {/* Ripple Button */}
            <div className="text-center">
              <button className="btn-ripple bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300">
                Ripple Effect
              </button>
            </div>

            {/* Shimmer Text */}
            <div className="text-center">
              <h3 className="shimmer-text text-2xl font-bold mb-2">
                Shimmer Text
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Animated gradient
              </p>
            </div>
          </div>
        </div>

        {/* Movie Card Test */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 text-center`}>
            Movie Card Animations
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item, index) => (
              <div 
                key={item}
                className={`movie-card-3d micro-bounce ${animationStage >= 4 ? `grid-stagger-${index + 1} scale-in` : ''}`}
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 glow">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Star className="w-12 h-12 text-white animate-pulse" />
                  </div>
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
                      Movie Card {item}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Test Movie {item}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Animation Test
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Tips */}
        <div className={`mt-12 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-2xl p-6`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-800'} mb-3`}>
            Performance Tips
          </h3>
          <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
            <li>• Target 60 FPS for smooth animations</li>
            <li>• Use transform and opacity for GPU acceleration</li>
            <li>• Throttle scroll events to prevent performance issues</li>
            <li>• Use will-change property sparingly</li>
            <li>• Test on various devices and browsers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnimationTestPage;
