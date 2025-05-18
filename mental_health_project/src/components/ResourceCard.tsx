import React from 'react';
import { ExternalLink, Quote, Wind, Brain, BookOpen } from 'lucide-react';

interface ResourceCardProps {
  type: 'quote' | 'breathing' | 'mindfulness' | 'coping' | 'resource';
  title: string;
  content: string;
  source?: string;
  url?: string;
  darkMode: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  type,
  title,
  content,
  source,
  url,
  darkMode
}) => {
  // Get icon based on resource type
  const getIcon = () => {
    switch (type) {
      case 'quote':
        return <Quote className="h-5 w-5 text-indigo-500" />;
      case 'breathing':
        return <Wind className="h-5 w-5 text-blue-500" />;
      case 'mindfulness':
        return <Brain className="h-5 w-5 text-green-500" />;
      case 'coping':
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      case 'resource':
        return <ExternalLink className="h-5 w-5 text-teal-500" />;
      default:
        return <Quote className="h-5 w-5 text-indigo-500" />;
    }
  };

  return (
    <div className={`mt-4 p-3 rounded-lg border ${
      darkMode 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <h3 className={`text-sm font-medium ${
          darkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {title}
        </h3>
      </div>
      
      <div className={`text-sm mb-2 ${
        darkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {content}
      </div>
      
      {source && (
        <div className={`text-xs italic ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          — {source}
        </div>
      )}
      
      {url && (
        <a 
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-2 flex items-center gap-1 text-xs ${
            darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
          }`}
        >
          <ExternalLink className="h-3 w-3" />
          <span>Visit website</span>
        </a>
      )}
    </div>
  );
};

export default ResourceCard; 