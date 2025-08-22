import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* Modern spinner with gradient */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className={`absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin`}></div>
      </div>
      
      {text && (
        <p className="mt-4 text-gray-600 text-sm font-medium">{text}</p>
      )}
    </div>
  );
}

export function LoadingDots({ text = 'Loading' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center space-x-1">
      <span className="text-gray-600 font-medium">{text}</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}

export function LoadingBar({ progress = 0 }: { progress?: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }}
      ></div>
    </div>
  );
}

// New modern loading spinner
export function ModernSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
        
        {/* Animated ring */}
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
      </div>
      
      {text && (
        <p className="mt-4 text-gray-600 text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
}

// Pulse loading spinner
export function PulseSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 bg-blue-500 rounded-full animate-pulse"></div>
      {text && (
        <p className="mt-4 text-gray-600 text-sm font-medium">{text}</p>
      )}
    </div>
  );
}
