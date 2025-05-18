import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX, User, Bot, BarChart2, X } from 'lucide-react';
import VoiceWaveAnimation from './VoiceWaveAnimation';
import ResourceCard from './ResourceCard';

interface Message {
  type: string;
  text: string;
  timestamp?: number;
  analysis?: {
    emotions?: {[key: string]: number};
    topics?: string[];
    sentiment?: {score: number; label: string};
  };
}

interface MessageListProps {
  conversations: Message[];
  isTyping: boolean;
  darkMode: boolean;
  isSpeaking: boolean;
  toggleSpeaking: (messageIndex?: number) => void;
  currentSpeakingIndex?: number | null;
}

const MessageList: React.FC<MessageListProps> = ({ 
  conversations, 
  isTyping, 
  darkMode, 
  isSpeaking, 
  toggleSpeaking,
  currentSpeakingIndex
}) => {
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [showAnalysis, setShowAnalysis] = useState<number | null>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const handleSpeak = (index: number) => {
    toggleSpeaking(index);
  };
  
  const toggleAnalysis = (index: number) => {
    setShowAnalysis(showAnalysis === index ? null : index);
  };
  
  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format sentiment score as a percentage
  const formatSentiment = (score: number): string => {
    const percentage = Math.round((score + 1) * 50); // Convert -1 to 1 range to 0-100%
    return `${percentage}%`;
  };
  
  // Get color based on sentiment
  const getSentimentColor = (label: string): string => {
    switch(label) {
      case 'very_positive': return 'text-green-500';
      case 'positive': return 'text-green-400';
      case 'neutral': return 'text-gray-400';
      case 'negative': return 'text-red-400';
      case 'very_negative': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };
  
  // Parse external resources from message text
  const parseResources = (text: string): JSX.Element | null => {
    // Check if the message contains any resources
    if (!text.includes('\n\n')) return null;
    
    const parts = text.split('\n\n');
    const mainMessage = parts[0];
    const resourceText = parts.slice(1).join('\n\n');
    
    // Identify resource type
    if (resourceText.startsWith('"') && resourceText.includes('" - ')) {
      // It's a quote
      const quoteMatch = resourceText.match(/"([^"]+)" - (.+)/);
      if (quoteMatch) {
        const [, content, author] = quoteMatch;
        return (
          <ResourceCard 
            type="quote"
            title="Inspirational Quote"
            content={content}
            source={author}
            darkMode={darkMode}
          />
        );
      }
    } else if (resourceText.startsWith('Breathing Exercise:')) {
      // It's a breathing exercise
      const content = resourceText.replace('Breathing Exercise:', '').trim();
      return (
        <ResourceCard 
          type="breathing"
          title="Breathing Exercise"
          content={content}
          darkMode={darkMode}
        />
      );
    } else if (resourceText.startsWith('Mindfulness Practice -')) {
      // It's a mindfulness practice
      const titleMatch = resourceText.match(/Mindfulness Practice - ([^:]+):/);
      const title = titleMatch ? titleMatch[1] : "Mindfulness Practice";
      const content = resourceText.replace(/Mindfulness Practice - [^:]+:/, '').trim();
      return (
        <ResourceCard 
          type="mindfulness"
          title={title}
          content={content}
          darkMode={darkMode}
        />
      );
    } else if (resourceText.startsWith('Coping Strategy -')) {
      // It's a coping strategy
      const titleMatch = resourceText.match(/Coping Strategy - ([^:]+):/);
      const title = titleMatch ? titleMatch[1] : "Coping Strategy";
      const content = resourceText.replace(/Coping Strategy - [^:]+:/, '').trim();
      return (
        <ResourceCard 
          type="coping"
          title={title}
          content={content}
          darkMode={darkMode}
        />
      );
    } else if (resourceText.startsWith('Resource:')) {
      // It's a mental health resource
      const lines = resourceText.split('\n');
      const titleLine = lines[0].replace('Resource:', '').trim();
      const titleParts = titleLine.split(' - ');
      const title = titleParts[0];
      const description = titleParts.slice(1).join(' - ');
      
      // Check for URL
      let url = '';
      if (lines.length > 1 && lines[1].startsWith('Website:')) {
        url = lines[1].replace('Website:', '').trim();
      }
      
      // Check for phone
      let phone = '';
      if (lines.length > 1 && lines[1].includes('Contact:')) {
        phone = lines[1].replace('Contact:', '').trim();
      }
      
      return (
        <ResourceCard 
          type="resource"
          title={title}
          content={description + (phone ? `\nContact: ${phone}` : '')}
          url={url}
          darkMode={darkMode}
        />
      );
    }
    
    return null;
  };
  
  // Split message into main content and resource
  const renderMessageContent = (text: string): JSX.Element => {
    if (!text.includes('\n\n')) {
      return <div className="whitespace-pre-wrap">{text}</div>;
    }
    
    const parts = text.split('\n\n');
    const mainMessage = parts[0];
    
    return (
      <>
        <div className="whitespace-pre-wrap">{mainMessage}</div>
        {parseResources(text)}
      </>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {conversations.map((item, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div 
              className={`p-4 rounded-lg max-w-[85%] ${
                item.type === 'entry' 
                  ? `ml-auto ${darkMode ? 'bg-indigo-900' : 'bg-indigo-100'}` 
                  : `${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`
              }`}
            >
              <div className="flex items-start">
                {item.type === 'response' ? (
                  <Bot className={`h-5 w-5 mr-2 mt-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                ) : (
                  <User className={`h-5 w-5 mr-2 mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
                <div className="flex-1">
                  <div className={`text-xs mb-1 flex justify-between ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>{item.type === 'response' ? 'AI Therapist' : 'You'}</span>
                    {item.timestamp && <span>{formatDate(item.timestamp)}</span>}
                  </div>
                  {renderMessageContent(item.text)}
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-end gap-2">
                {/* Analysis button for user messages */}
                {item.type === 'entry' && item.analysis && (
                  <button
                    onClick={() => toggleAnalysis(index)}
                    className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    aria-label={showAnalysis === index ? "Hide analysis" : "Show analysis"}
                    title={showAnalysis === index ? "Hide analysis" : "Show message analysis"}
                  >
                    {showAnalysis === index ? (
                      <X className="h-4 w-4 text-indigo-500" />
                    ) : (
                      <BarChart2 className="h-4 w-4 text-indigo-500" />
                    )}
                  </button>
                )}
                
                {/* Speak button for AI responses */}
                {item.type === 'response' && (
                  <button
                    onClick={() => handleSpeak(index)}
                    className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    aria-label={isSpeaking && currentSpeakingIndex === index ? "Stop speaking" : "Speak message"}
                    title={isSpeaking && currentSpeakingIndex === index ? "Stop speaking" : "Listen to response"}
                  >
                    {isSpeaking && currentSpeakingIndex === index ? (
                      <VolumeX className="h-4 w-4 text-indigo-500" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-indigo-500" />
                    )}
                  </button>
                )}
                
                {isSpeaking && currentSpeakingIndex === index && (
                  <VoiceWaveAnimation
                    isActive={true}
                    type="speaking"
                    darkMode={darkMode}
                  />
                )}
              </div>
              
              {/* Analysis panel */}
              {showAnalysis === index && item.analysis && (
                <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Message Analysis
                  </h4>
                  
                  {/* Sentiment */}
                  {item.analysis.sentiment && (
                    <div className="mb-2">
                      <div className="text-xs mb-1 flex justify-between items-center">
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sentiment</span>
                        <span className={getSentimentColor(item.analysis.sentiment.label)}>
                          {item.analysis.sentiment.label.replace('_', ' ')} ({formatSentiment(item.analysis.sentiment.score)})
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                        <div 
                          className={`h-1.5 rounded-full ${
                            item.analysis.sentiment.score > 0 ? 'bg-green-500' : 'bg-red-500'
                          }`} 
                          style={{ 
                            width: formatSentiment(item.analysis.sentiment.score),
                            marginLeft: item.analysis.sentiment.score <= 0 ? '50%' : '0',
                            transform: item.analysis.sentiment.score <= 0 ? `translateX(${item.analysis.sentiment.score * 100}%)` : 'none'
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Emotions */}
                  {item.analysis.emotions && Object.keys(item.analysis.emotions).length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs mb-1 flex justify-between">
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Emotions</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.analysis.emotions)
                          .filter(([_, value]) => value > 0.2) // Only show emotions with significant presence
                          .sort(([_, a], [__, b]) => b - a) // Sort by intensity
                          .slice(0, 3) // Show top 3
                          .map(([emotion, intensity]) => (
                            <div 
                              key={emotion} 
                              className={`text-xs px-2 py-1 rounded-full ${
                                darkMode ? 'bg-gray-700' : 'bg-gray-100'
                              }`}
                              title={`Intensity: ${Math.round(intensity * 100)}%`}
                            >
                              {emotion} {intensity > 0.6 ? '●●' : intensity > 0.3 ? '●' : '○'}
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                  
                  {/* Topics */}
                  {item.analysis.topics && item.analysis.topics.length > 0 && (
                    <div>
                      <div className="text-xs mb-1">
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Topics</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.analysis.topics.map(topic => (
                          <div 
                            key={topic} 
                            className={`text-xs px-2 py-1 rounded-full ${
                              darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
                            }`}
                          >
                            {topic}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <div className="flex items-center">
              <Bot className={`h-5 w-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mr-2`}>
                AI Therapist is thinking
              </span>
              <VoiceWaveAnimation
                isActive={true}
                type="processing"
                darkMode={darkMode}
              />
            </div>
          </div>
        )}
        <div ref={conversationEndRef} />
      </div>
    </div>
  );
};

export default MessageList; 