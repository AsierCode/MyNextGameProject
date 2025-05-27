
import React from 'react';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  let spinnerSizeClasses = 'w-12 h-12';
  let segmentSizeClasses = 'w-3 h-3'; // md default
  if (size === 'sm') {
    spinnerSizeClasses = 'w-6 h-6';
    segmentSizeClasses = 'w-1.5 h-1.5';
  }
  if (size === 'lg') {
    spinnerSizeClasses = 'w-20 h-20';
    segmentSizeClasses = 'w-4 h-4';
  }

  return (
    <div className="flex justify-center items-center my-8" role="status" aria-live="polite">
      <div className={`relative ${spinnerSizeClasses} animate-spin-slow`}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`absolute ${segmentSizeClasses} bg-fuchsia-500 rounded-full opacity-75 animate-pulse-segment`}
            style={{
              transform: `rotate(${i * (360 / 5)}deg) translate(${parseFloat(spinnerSizeClasses.split(' ')[0].substring(2))/2.5}rem)`, // Adjust translation based on size
              animationDelay: `${i * 0.1}s`,
            }}
          ></div>
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;

// Add these to your index.html <style> or a global CSS file
/*
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 2s linear infinite;
}

@keyframes pulse-segment {
  0%, 100% { opacity: 0.2; transform: scale(0.8) rotate(var(--rotate)) translate(var(--translate)); }
  50% { opacity: 1; transform: scale(1.1) rotate(var(--rotate)) translate(var(--translate)); }
}
.animate-pulse-segment {
  animation: pulse-segment 1.5s infinite ease-in-out;
}

Usage in component requires setting CSS variables for transform if not done directly inline as above for simplicity.
The inline style for transform has been adjusted to be more dynamic based on size.
For animationDelay, it's fine.
*/
