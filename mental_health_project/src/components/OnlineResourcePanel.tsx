import React from 'react';
import { ExternalLink, BookOpen, Check, X } from 'lucide-react';

interface OnlineResourcePanelProps {
  resourceData: {
    title: string;
    source: string;
    url?: string;
    summary: string;
    treatments?: string[];
    management_techniques?: string[];
    general_resources?: string[];
  };
  darkMode: boolean;
  onClose: () => void;
}

const OnlineResourcePanel: React.FC<OnlineResourcePanelProps> = ({
  resourceData,
  darkMode,
  onClose
}) => {
  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 ${
      darkMode ? 'bg-gray-800 text-gray-100 border-t border-gray-700' : 'bg-white text-gray-900 border-t border-gray-200'
    } shadow-lg`}>
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <BookOpen className={`h-5 w-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h3 className="text-lg font-medium">Online Resource</h3>
          </div>
          
          <button 
            onClick={onClose}
            className={`p-1 rounded-full ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-3">
          <h4 className="text-xl font-semibold mb-1">{resourceData.title}</h4>
          <div className="flex items-center text-sm">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Source: {resourceData.source}
            </span>
            {resourceData.url && (
              <a 
                href={resourceData.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`ml-3 flex items-center ${
                  darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
                }`}
              >
                <span className="mr-1">Visit website</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        
        <div className={`mb-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <p>{resourceData.summary}</p>
        </div>
        
        {resourceData.treatments && resourceData.treatments.length > 0 && (
          <div className="mb-4">
            <h5 className={`text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Common Treatments
            </h5>
            <ul className={`list-none space-y-1 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {resourceData.treatments.map((treatment, index) => (
                <li key={index} className="flex items-start">
                  <Check className={`h-4 w-4 mr-2 mt-0.5 ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <span className="text-sm">{treatment}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {resourceData.management_techniques && resourceData.management_techniques.length > 0 && (
          <div className="mb-4">
            <h5 className={`text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Management Techniques
            </h5>
            <ul className={`list-none space-y-1 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {resourceData.management_techniques.map((technique, index) => (
                <li key={index} className="flex items-start">
                  <Check className={`h-4 w-4 mr-2 mt-0.5 ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <span className="text-sm">{technique}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {resourceData.general_resources && resourceData.general_resources.length > 0 && (
          <div className="mb-4">
            <h5 className={`text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              General Resources
            </h5>
            <ul className={`list-none space-y-1 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {resourceData.general_resources.map((resource, index) => (
                <li key={index} className="flex items-start">
                  <Check className={`h-4 w-4 mr-2 mt-0.5 ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <span className="text-sm">{resource}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className={`text-xs italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Information is for educational purposes only and is not a substitute for professional medical advice.
        </div>
      </div>
    </div>
  );
};

export default OnlineResourcePanel; 