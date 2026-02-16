import React from 'react';

const WelcomeHeader = ({ userName, greeting, isLoaded = true }) => {
  // Dynamic time-of-day greeting
  const getGreeting = () => {
    if (greeting) return greeting;
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️';
    if (hour < 17) return '🌤️';
    return '🌙';
  };

  return (
    <div className={`mb-12 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{getEmoji()}</span>
        <p className="text-slate-500 text-sm font-semibold tracking-widest uppercase">
          Welcome Back
        </p>
      </div>
      <h2 className="text-5xl font-extrabold mb-3 gradient-text-animated leading-tight">
        {getGreeting()}, {userName}
      </h2>
      <p className="text-slate-500 text-lg font-medium max-w-lg" style={{ animationDelay: '100ms' }}>
        Track your progress and optimize your career trajectory ✨
      </p>
    </div>
  );
};

export default WelcomeHeader;