import { useState, useEffect, useRef } from 'react';

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  hasSynthesisSupport: boolean;
}

/**
 * Custom hook for speech synthesis functionality
 */
export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSynthesisSupport, setHasSynthesisSupport] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if speech synthesis is supported
    if ('speechSynthesis' in window) {
      setHasSynthesisSupport(true);
    }

    // Clean up any ongoing speech when component unmounts
    return () => {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Fix for Chrome issue where speechSynthesis sometimes gets stuck
  useEffect(() => {
    if (!hasSynthesisSupport) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
        }
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasSynthesisSupport]);

  const speak = (text: string) => {
    if (!hasSynthesisSupport) return;

    // If already speaking, cancel it first
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      
      // If we were already speaking the same text, just stop
      if (utteranceRef.current?.text === text) {
        utteranceRef.current = null;
        return;
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    utterance.rate = 0.9; // Slightly slower than default
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
      console.error('Speech synthesis error');
    };

    window.speechSynthesis.speak(utterance);
  };

  const cancel = () => {
    if (hasSynthesisSupport && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  };

  return {
    speak,
    cancel,
    isSpeaking,
    hasSynthesisSupport
  };
}; 