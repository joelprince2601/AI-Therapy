import React, { useState, useEffect } from 'react';
import { X, Phone, MessageSquare, Globe, Clock, AlertTriangle, MessageCircle } from 'lucide-react';
import { getUserLocation, getCrisisResourcesByCountry, CrisisResources, CrisisResource } from '../utils/geoLocationUtils';

interface CrisisResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  triggerPhrase?: string;
}

const CrisisResourcesModal: React.FC<CrisisResourcesModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  triggerPhrase
}) => {
  const [resources, setResources] = useState<CrisisResources | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get user location
        const location = await getUserLocation();
        
        // Get resources based on location
        const countryResources = getCrisisResourcesByCountry(location.countryCode);
        setResources(countryResources);
      } catch (err) {
        console.error('Error fetching crisis resources:', err);
        setError('Unable to load crisis resources. Please call your local emergency number if you need immediate help.');
        
        // Default to US resources as fallback
        setResources(getCrisisResourcesByCountry('US'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
          darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crisis-resources-title"
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 flex justify-between items-center p-4 border-b ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 
            id="crisis-resources-title" 
            className="text-xl font-bold flex items-center"
          >
            <AlertTriangle className="mr-2 h-6 w-6 text-red-500" />
            Crisis Support Resources
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${
              darkMode 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title="Close"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Support message */}
          <div className={`mb-6 p-4 rounded-lg border ${
            darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-red-50 border-red-100'
          }`}>
            <p className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {triggerPhrase ? (
                <>
                  We noticed you mentioned <span className="font-semibold">"{triggerPhrase}"</span>. 
                  Your wellbeing matters to us. Below are resources that can provide immediate support.
                </>
              ) : (
                <>
                  If you're experiencing thoughts of harming yourself or feeling overwhelmed, 
                  please reach out to one of these professional resources who can help.
                </>
              )}
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className={`p-4 rounded-lg border ${
              darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'
            }`}>
              <p className="text-red-500">{error}</p>
            </div>
          ) : resources ? (
            <>
              {/* Emergency number */}
              <div className={`mb-6 p-4 rounded-lg border ${
                darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'
              }`}>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-red-500" />
                  Emergency Services ({resources.country})
                </h3>
                <p className={`text-xl font-bold ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  {resources.emergencyNumber}
                </p>
                <p className="text-sm mt-1 text-gray-500">
                  If you or someone else is in immediate danger, call your local emergency number.
                </p>
              </div>
              
              {/* Crisis resources */}
              <h3 className="text-lg font-medium mb-4">Support Resources</h3>
              <div className="space-y-4">
                {resources.resources.map((resource, index) => (
                  <ResourceCard 
                    key={index} 
                    resource={resource} 
                    darkMode={darkMode} 
                  />
                ))}
              </div>
              
              {/* Disclaimer */}
              <div className="mt-6 text-xs text-gray-500">
                <p>
                  This information is provided as a resource and does not constitute an endorsement. 
                  The AI Therapy Assistant is not a substitute for professional help.
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Resource card component
interface ResourceCardProps {
  resource: CrisisResource;
  darkMode: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, darkMode }) => {
  return (
    <div className={`p-4 rounded-lg border ${
      darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
    }`}>
      <h4 className="font-medium text-lg mb-1">{resource.name}</h4>
      <p className={`text-sm mb-3 ${
        darkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {resource.description}
      </p>
      
      <div className="space-y-2">
        {resource.phone && (
          <div className="flex items-center">
            <Phone className={`h-4 w-4 mr-2 ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
            <a 
              href={`tel:${resource.phone.replace(/\D/g, '')}`}
              className={`text-sm ${
                darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
              }`}
            >
              {resource.phone}
            </a>
          </div>
        )}
        
        {resource.sms && (
          <div className="flex items-center">
            <MessageSquare className={`h-4 w-4 mr-2 ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
            <span className="text-sm">{resource.sms}</span>
          </div>
        )}
        
        {resource.chat && (
          <div className="flex items-center">
            <MessageCircle className={`h-4 w-4 mr-2 ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
            <a 
              href={resource.chat}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm ${
                darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
              }`}
            >
              Online Chat
            </a>
          </div>
        )}
        
        {resource.email && (
          <div className="flex items-center">
            <MessageCircle className={`h-4 w-4 mr-2 ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
            <a 
              href={`mailto:${resource.email}`}
              className={`text-sm ${
                darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
              }`}
            >
              {resource.email}
            </a>
          </div>
        )}
        
        {resource.website && (
          <div className="flex items-center">
            <Globe className={`h-4 w-4 mr-2 ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`} />
            <a 
              href={resource.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm ${
                darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
              }`}
            >
              Visit Website
            </a>
          </div>
        )}
        
        {resource.hours && (
          <div className="flex items-center">
            <Clock className={`h-4 w-4 mr-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`} />
            <span className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {resource.hours}
            </span>
          </div>
        )}
        
        {resource.languages && resource.languages.length > 0 && (
          <div className="mt-2">
            <span className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Available in: {resource.languages.join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrisisResourcesModal; 