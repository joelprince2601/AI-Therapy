import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MessageList from './components/MessageList';
import InputForm from './components/InputForm';
import DiagnosticSummary from './components/DiagnosticSummary';
import OnlineResourcePanel from './components/OnlineResourcePanel';
import EmotionTracker from './components/EmotionTracker';
import CrisisResourcesModal from './components/CrisisResourcesModal';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useConversation } from './hooks/useConversation';
import { useTheme } from './hooks/useTheme';
import { useCrisisDetection } from './utils/crisisDetectionUtils';
import { 
  generateDiagnosticAssessment,
  searchMentalHealthInformation,
  DiagnosticAnalysisResponse
} from './utils/externalApiUtils';

function App() {
  const [entry, setEntry] = useState('');
  const { darkMode, toggleDarkMode } = useTheme();
  const { 
    conversations, 
    isTyping, 
    addUserMessage, 
    clearConversation, 
    sessionState,
    isSpeaking,
    toggleSpeaking,
    userProfile,
    currentSpeakingIndex,
    emotionHistory
  } = useConversation();
  
  // Initialize crisis detection hook
  const {
    isCrisisDetected,
    crisisPhrase,
    showModal: showCrisisModal,
    checkMessage,
    closeModal: closeCrisisModal
  } = useCrisisDetection();
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    hasRecognitionSupport, 
    isProcessingVoice 
  } = useSpeechRecognition();
  
  // State for diagnostic assessment
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticAnalysisResponse | null>(null);
  
  // State for online resources
  const [showResourcePanel, setShowResourcePanel] = useState(false);
  const [resourceData, setResourceData] = useState<any>(null);
  
  // State for emotion tracker
  const [showEmotionTracker, setShowEmotionTracker] = useState(false);
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');

  // Update entry when transcript changes from speech recognition
  useEffect(() => {
    if (transcript && isListening) {
      setEntry(transcript);
    }
  }, [transcript, isListening]);
  
  // Function to end conversation and generate diagnostic assessment
  const endConversation = async () => {
    try {
      // Generate diagnostic assessment based on conversation history
      const assessment = await generateDiagnosticAssessment(conversations);
      
      if (assessment) {
        setDiagnosticData(assessment);
        setShowDiagnostic(true);
      }
    } catch (error) {
      console.error('Error generating diagnostic assessment:', error);
    }
  };
  
  // Function to search for mental health information
  const searchInformation = async (query: string) => {
    try {
      const results = await searchMentalHealthInformation(query);
      
      if (results) {
        setResourceData(results);
        setShowResourcePanel(true);
      }
    } catch (error) {
      console.error('Error searching for information:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim()) return;

    // Stop listening if active
    if (isListening) {
      stopListening();
    }

    // Check if it's a search query
    if (entry.toLowerCase().startsWith('search:') || entry.toLowerCase().startsWith('find:')) {
      const query = entry.substring(entry.indexOf(':') + 1).trim();
      setSearchQuery(query);
      searchInformation(query);
      setEntry('');
      return;
    }

    // Check for crisis phrases before sending the message
    const isCrisis = checkMessage(entry);

    // Add user message and get AI response
    addUserMessage(entry, isCrisis, crisisPhrase);
    setEntry('');
  };

  const toggleListening = () => {
    if (!hasRecognitionSupport) return;

    if (isListening) {
      stopListening();
      // Submit the current transcript if there is one
      if (transcript.trim()) {
        // Small delay to ensure we have the final transcript
        setTimeout(() => {
          if (entry.trim()) {
            handleSubmit(new Event('submit') as any);
          }
        }, 300);
      }
    } else {
      setEntry('');
      startListening();
    }
  };

  // Toggle emotion tracker visibility
  const toggleEmotionTracker = () => {
    setShowEmotionTracker(!showEmotionTracker);
    // Hide resource panel when showing emotion tracker
    if (!showEmotionTracker) {
      setShowResourcePanel(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Header 
        darkMode={darkMode} 
        setDarkMode={toggleDarkMode}
        clearConversation={clearConversation}
        endConversation={endConversation}
        toggleEmotionTracker={toggleEmotionTracker}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <MessageList 
            conversations={conversations} 
            isTyping={isTyping} 
            darkMode={darkMode} 
            isSpeaking={isSpeaking}
            toggleSpeaking={toggleSpeaking}
            currentSpeakingIndex={currentSpeakingIndex}
          />
          
          <InputForm 
            entry={entry}
            setEntry={setEntry}
            handleSubmit={handleSubmit}
            isTyping={isTyping}
            isListening={isListening}
            isProcessingVoice={isProcessingVoice}
            toggleListening={toggleListening}
            darkMode={darkMode}
            onSearchClick={() => setEntry('search: ')}
          />
        </div>
        
        {/* User Profile Sidebar - conditionally rendered if we have profile data */}
        {userProfile && sessionState.sessionDepth > 2 && !showEmotionTracker && (
          <div className={`hidden lg:block w-72 border-l p-4 overflow-y-auto ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-medium mb-4 ${
              darkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Client Profile
            </h3>
            
            {/* Communication Style */}
            <div className="mb-6">
              <h4 className={`text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Communication Style
              </h4>
              <div className="space-y-2">
                {Object.entries(userProfile.communicationStyle).map(([style, value]) => (
                  <div key={style} className="flex items-center">
                    <span className={`text-xs capitalize ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {style}
                    </span>
                    <div className="flex-1 mx-2">
                      <div className={`h-1.5 rounded-full ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <div 
                          className="h-1.5 rounded-full bg-indigo-500" 
                          style={{ width: `${value * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Interests */}
            {Object.keys(userProfile.interests).length > 0 && (
              <div className="mb-6">
                <h4 className={`text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Interests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(userProfile.interests)
                    .sort(([_, a], [__, b]) => b - a)
                    .map(([interest, level]) => (
                      <div 
                        key={interest}
                        className={`text-xs px-2 py-1 rounded-full ${
                          darkMode 
                            ? `bg-indigo-900/50 border border-indigo-800` 
                            : `bg-indigo-100 border border-indigo-200`
                        }`}
                        title={`Interest level: ${Math.round(level * 100)}%`}
                      >
                        {interest} {level > 0.7 ? '●●' : level > 0.4 ? '●' : '○'}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Concerns */}
            {Object.keys(userProfile.concerns).length > 0 && (
              <div className="mb-6">
                <h4 className={`text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Concerns
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(userProfile.concerns)
                    .sort(([_, a], [__, b]) => b - a)
                    .map(([concern, level]) => (
                      <div 
                        key={concern}
                        className={`text-xs px-2 py-1 rounded-full ${
                          darkMode 
                            ? `bg-red-900/30 border border-red-800` 
                            : `bg-red-100 border border-red-200`
                        }`}
                        title={`Concern level: ${Math.round(level * 100)}%`}
                      >
                        {concern} {level > 0.7 ? '●●' : level > 0.4 ? '●' : '○'}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Topics Discussed */}
            {userProfile.learningHistory.topicsDiscussed.length > 0 && (
              <div className="mb-6">
                <h4 className={`text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Topics Discussed
                </h4>
                <ul className={`text-xs list-disc pl-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {userProfile.learningHistory.topicsDiscussed.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Personality Traits */}
            <div className="mb-6">
              <h4 className={`text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Personality Traits
              </h4>
              <div className="space-y-2">
                {Object.entries(userProfile.personalityTraits).map(([trait, value]) => (
                  <div key={trait} className="flex items-center">
                    <span className={`text-xs capitalize ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {trait}
                    </span>
                    <div className="flex-1 mx-2">
                      <div className={`h-1.5 rounded-full ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <div 
                          className="h-1.5 rounded-full bg-indigo-500" 
                          style={{ width: `${value * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Session Info */}
            <div>
              <h4 className={`text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Session Info
              </h4>
              <div className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <p>Session depth: {sessionState.sessionDepth}</p>
                <p>Current approach: {sessionState.approachUsed.join(', ')}</p>
              </div>
              </div>
            </div>
          )}
        
        {/* Emotion Tracker - conditionally rendered when toggled */}
        {showEmotionTracker && (
          <div className={`hidden lg:block w-72 border-l overflow-y-auto ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <EmotionTracker 
              darkMode={darkMode} 
              onClose={toggleEmotionTracker}
              sessionData={emotionHistory}
              currentUserProfile={userProfile}
            />
        </div>
        )}
      </div>
      
      {/* Diagnostic Summary Modal */}
      {showDiagnostic && diagnosticData && (
        <DiagnosticSummary 
          diagnosticData={diagnosticData}
          darkMode={darkMode}
          onClose={() => setShowDiagnostic(false)}
        />
      )}
      
      {/* Online Resource Panel */}
      {showResourcePanel && resourceData && (
        <OnlineResourcePanel
          resourceData={resourceData}
          darkMode={darkMode}
          onClose={() => setShowResourcePanel(false)}
        />
      )}
      
      {/* Mobile Emotion Tracker Modal */}
      {showEmotionTracker && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div 
            className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
              darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
            }`}
          >
            <EmotionTracker 
              darkMode={darkMode} 
              onClose={toggleEmotionTracker}
              sessionData={emotionHistory}
              currentUserProfile={userProfile}
            />
          </div>
      </div>
      )}
      
      {/* Crisis Resources Modal */}
      <CrisisResourcesModal
        isOpen={showCrisisModal}
        onClose={closeCrisisModal}
        darkMode={darkMode}
        triggerPhrase={crisisPhrase || undefined}
      />
    </div>
  );
}

export default App;