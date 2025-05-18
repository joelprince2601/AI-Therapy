import React from 'react';
import { Moon, Sun, Trash2, LogOut, BarChart2 } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  clearConversation: () => void;
  endConversation: () => void;
  toggleEmotionTracker?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  darkMode, 
  setDarkMode, 
  clearConversation,
  endConversation,
  toggleEmotionTracker
}) => {
  return (
    <header className={`py-4 px-6 flex items-center justify-between border-b ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center">
        <h1 className={`text-xl font-medium ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>
          AI Therapy Assistant
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {toggleEmotionTracker && (
          <button
            onClick={toggleEmotionTracker}
            className={`p-2 rounded-full ${
              darkMode 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="View emotional trends"
            title="View emotional trends"
          >
            <BarChart2 size={20} />
          </button>
        )}
        
        <button
          onClick={clearConversation}
          className={`p-2 rounded-full ${
            darkMode 
              ? 'text-gray-300 hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Clear conversation"
          title="Clear conversation"
        >
          <Trash2 size={20} />
        </button>
        
        <button
          onClick={endConversation}
          className={`p-2 rounded-full ${
            darkMode 
              ? 'text-gray-300 hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="End session"
          title="End session and generate summary"
        >
          <LogOut size={20} />
        </button>
        
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full ${
            darkMode 
              ? 'text-gray-300 hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header; 