import { useState, useEffect, useRef } from 'react';
import { 
  createInitialSessionState, 
  generateTherapistResponse, 
  getInitialGreeting,
  TherapySessionState
} from '../utils/therapistUtils';
import { UserProfile } from '../utils/nlpUtils';
import { EmotionEntry } from '../components/EmotionTracker';
import { getCrisisResponse } from '../utils/crisisDetectionUtils';

export interface Message {
  type: 'entry' | 'response';
  text: string;
  timestamp?: number;
  analysis?: {
    emotions?: {[key: string]: number};
    topics?: string[];
    sentiment?: {score: number; label: string};
  };
}

interface UseConversationReturn {
  conversations: Message[];
  isTyping: boolean;
  addUserMessage: (text: string, isCrisisDetected: boolean, crisisPhrase: string | null) => void;
  clearConversation: () => void;
  sessionState: TherapySessionState;
  isSpeaking: boolean;
  toggleSpeaking: (messageIndex?: number) => void;
  userProfile: UserProfile | null;
  currentSpeakingIndex: number | null;
  emotionHistory: EmotionEntry[];
}

/**
 * Custom hook for managing conversation state with therapeutic capabilities
 */
export const useConversation = (): UseConversationReturn => {
  const [conversations, setConversations] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionState, setSessionState] = useState<TherapySessionState>(createInitialSessionState());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState<number | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionEntry[]>([]);
  const typingTimerRef = useRef<number | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load saved conversations from localStorage on initial render
  useEffect(() => {
    const savedConversations = localStorage.getItem('journal-conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    } else {
      // Set initial welcome message - handle async getInitialGreeting
      const loadInitialGreeting = async () => {
        const greeting = await getInitialGreeting();
        setConversations([
          {
            type: 'response',
            text: greeting,
            timestamp: Date.now()
          }
        ]);
      };
      
      loadInitialGreeting();
    }

    // Load saved session state if available
    const savedSessionState = localStorage.getItem('journal-session-state');
    if (savedSessionState) {
      try {
        setSessionState(JSON.parse(savedSessionState));
      } catch (error) {
        console.error('Error parsing saved session state:', error);
        setSessionState(createInitialSessionState());
      }
    }
    
    // Load saved emotion history if available
    const savedEmotionHistory = localStorage.getItem('journal-emotion-data');
    if (savedEmotionHistory) {
      try {
        setEmotionHistory(JSON.parse(savedEmotionHistory));
      } catch (error) {
        console.error('Error parsing saved emotion history:', error);
        setEmotionHistory([]);
      }
    }
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthRef.current = new SpeechSynthesisUtterance();
      speechSynthRef.current.rate = 0.9; // Slightly slower than default
      speechSynthRef.current.pitch = 1.0;
      
      // Set voice to a more natural sounding one if available
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        // Try to find a natural sounding voice
        const preferredVoices = voices.filter(voice => 
          voice.name.includes('Natural') || 
          voice.name.includes('Premium') ||
          voice.name.includes('Neural')
        );
        
        if (preferredVoices.length > 0) {
          speechSynthRef.current!.voice = preferredVoices[0];
        }
      };
      
      // Handle speech end event
      speechSynthRef.current.onend = () => {
        setIsSpeaking(false);
        setCurrentSpeakingIndex(null);
      };
    }
    
    // Clean up speech synthesis on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('journal-conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Save session state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('journal-session-state', JSON.stringify(sessionState));
  }, [sessionState]);
  
  // Save emotion history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('journal-emotion-data', JSON.stringify(emotionHistory));
  }, [emotionHistory]);

  // Calculate a dynamic typing delay based on response length
  const calculateTypingDelay = (text: string): number => {
    const baseDelay = 1000; // Minimum delay in ms
    const wordsPerMinute = 200; // Simulated reading/typing speed
    const wordCount = text.split(/\s+/).length;
    const readingTime = (wordCount / wordsPerMinute) * 60 * 1000; // Convert to ms
    
    return Math.min(Math.max(baseDelay, readingTime), 3000); // Between 1-3 seconds
  };

  const addUserMessage = (text: string, isCrisisDetected: boolean = false, crisisPhrase: string | null = null) => {
    if (!text.trim()) return;
    
    // Add user message with timestamp
    const timestamp = Date.now();
    const newUserMessage: Message = { 
      type: 'entry', 
      text, 
      timestamp 
    };
    
    const newConversations = [...conversations, newUserMessage];
    setConversations(newConversations);
    setIsTyping(true);
    
    // Clear any existing typing timer
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }
    
    // Generate AI response with dynamic timing - handle async function
    const generateResponse = async () => {
      try {
        // Update session state with crisis information if detected
        let updatedSessionState = {...sessionState};
        if (isCrisisDetected) {
          updatedSessionState.crisisDetected = true;
        }
        
        const { response, updatedState } = await generateTherapistResponse(
          text, 
          updatedSessionState,
          conversations
        );
        
        // If crisis detected, prepend crisis response
        let finalResponse = response;
        if (isCrisisDetected && crisisPhrase) {
          const crisisResponse = getCrisisResponse(crisisPhrase);
          finalResponse = `${crisisResponse}\n\n${response}`;
        }
        
        // Extract analysis data from the updated session state
        const analysisData = updatedState.lastAnalysis ? {
          emotions: updatedState.lastAnalysis.emotions,
          topics: updatedState.lastAnalysis.topics,
          sentiment: {
            score: updatedState.lastAnalysis.sentiment.score,
            label: updatedState.lastAnalysis.sentiment.label
          }
        } : undefined;
        
        // Update the user message with analysis data
        const updatedConversations = [...newConversations];
        updatedConversations[updatedConversations.length - 1] = {
          ...newUserMessage,
          analysis: analysisData
        };
        
        // Add emotion data to history if emotions are detected
        if (analysisData && analysisData.emotions && Object.keys(analysisData.emotions).length > 0) {
          const newEmotionEntry: EmotionEntry = {
            timestamp,
            emotions: analysisData.emotions
          };
          
          setEmotionHistory(prevHistory => [...prevHistory, newEmotionEntry]);
        }
        
        const typingDelay = calculateTypingDelay(finalResponse);
        
        typingTimerRef.current = window.setTimeout(() => {
          const newResponse: Message = { 
            type: 'response', 
            text: finalResponse,
            timestamp: Date.now()
          };
          
          setConversations([...updatedConversations, newResponse]);
          setSessionState(updatedState);
          setIsTyping(false);
          typingTimerRef.current = null;
        }, typingDelay);
      } catch (error) {
        console.error('Error generating AI response:', error);
        setIsTyping(false);
        
        // Add a fallback response in case of error
        const errorResponse: Message = {
          type: 'response',
          text: "I'm having trouble processing that right now. Could you try expressing that in a different way?",
          timestamp: Date.now()
        };
        
        setConversations([...newConversations, errorResponse]);
      }
    };
    
    // Start the async response generation
    generateResponse();
  };

  const clearConversation = () => {
    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    setIsSpeaking(false);
    setCurrentSpeakingIndex(null);
    
    // Set initial welcome message - handle async getInitialGreeting
    const loadInitialGreeting = async () => {
      try {
        const greeting = await getInitialGreeting();
        setConversations([
          {
            type: 'response',
            text: greeting,
            timestamp: Date.now()
          }
        ]);
      } catch (error) {
        console.error('Error getting initial greeting:', error);
        // Fallback to basic greeting
        setConversations([
          {
            type: 'response',
            text: "Hello, I'm here to support you. How are you feeling today?",
            timestamp: Date.now()
          }
        ]);
      }
    };
    
    loadInitialGreeting();
    setSessionState(createInitialSessionState());
    
    // Don't clear emotion history when clearing conversation
    // This allows users to maintain their emotional tracking over time
  };
  
  // Toggle speech synthesis for a message
  const toggleSpeaking = (messageIndex?: number) => {
    if (!('speechSynthesis' in window) || !speechSynthRef.current) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }
    
    // If already speaking, stop it
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
      return;
    }
    
    // Find the message to speak
    let messageToSpeak: Message | undefined;
    if (messageIndex !== undefined) {
      messageToSpeak = conversations[messageIndex];
    } else {
      // Default to the last AI response
      const aiResponses = conversations.filter(msg => msg.type === 'response');
      messageToSpeak = aiResponses[aiResponses.length - 1];
    }
    
    if (!messageToSpeak) return;
    
    // Set the text to speak
    speechSynthRef.current.text = messageToSpeak.text;
    
    // Start speaking
    window.speechSynthesis.speak(speechSynthRef.current);
    setIsSpeaking(true);
    setCurrentSpeakingIndex(messageIndex !== undefined ? messageIndex : null);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
      
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    conversations,
    isTyping,
    addUserMessage,
    clearConversation,
    sessionState,
    isSpeaking,
    toggleSpeaking,
    userProfile: sessionState.userProfile,
    currentSpeakingIndex,
    emotionHistory
  };
}; 