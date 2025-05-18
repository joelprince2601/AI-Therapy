import React, { useEffect, useState } from 'react';

interface VoiceWaveAnimationProps {
  isActive: boolean;
  type: 'listening' | 'processing' | 'speaking';
  darkMode: boolean;
}

const VoiceWaveAnimation: React.FC<VoiceWaveAnimationProps> = ({ isActive, type, darkMode }) => {
  const [waveHeights, setWaveHeights] = useState<number[]>([]);
  
  // For listening type, update wave heights periodically to create more dynamic effect
  useEffect(() => {
    if (!isActive || type !== 'listening') return;
    
    const generateRandomHeights = () => {
      return Array.from({ length: 6 }, () => Math.floor(Math.random() * 20) + 5);
    };
    
    setWaveHeights(generateRandomHeights());
    
    const interval = setInterval(() => {
      setWaveHeights(generateRandomHeights());
    }, 300);
    
    return () => clearInterval(interval);
  }, [isActive, type]);
  
  if (!isActive) return null;

  // Different wave patterns based on the type
  const getWavePattern = () => {
    switch (type) {
      case 'listening':
        // More dynamic, reactive waves for listening
        return (
          <div className="flex items-center justify-center space-x-1">
            {[1, 2, 3, 4, 5, 6].map((i) => {
              const height = waveHeights[i-1] || 10;
              return (
                <div 
                  key={i}
                  className={`w-1.5 rounded-full ${darkMode ? 'bg-indigo-400' : 'bg-indigo-500'} animate-sound-wave-random`}
                  style={{ 
                    height: `${height}px`,
                    animationDelay: `${i * 0.1}s`,
                    transition: 'height 0.2s ease-in-out'
                  }}
                ></div>
              );
            })}
          </div>
        );
      
      case 'processing':
        // Pulsing dots for processing
        return (
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'} animate-pulse`}
                style={{ animationDelay: `${i * 0.3}s` }}
              ></div>
            ))}
          </div>
        );
      
      case 'speaking':
        // Consistent, rhythmic waves for AI speaking
        return (
          <div className="flex items-center justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i}
                className={`w-1.5 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-500'} animate-sound-wave-speaking`}
                style={{ 
                  height: `${8 + (i % 3) * 6}px`,
                  animationDelay: `${i * 0.15}s`
                }}
              ></div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="inline-flex items-center ml-2">
      {getWavePattern()}
    </div>
  );
};

export default VoiceWaveAnimation; 