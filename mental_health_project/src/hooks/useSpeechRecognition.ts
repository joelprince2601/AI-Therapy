import { useState, useEffect, useRef } from 'react';

// Add type definition for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: Event) => void;
  onaudiostart: (event: Event) => void;
  onaudioend: (event: Event) => void;
  onsoundstart: (event: Event) => void;
  onsoundend: (event: Event) => void;
  onspeechstart: (event: Event) => void;
  onspeechend: (event: Event) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  isProcessingVoice: boolean;
}

/**
 * Custom hook for speech recognition functionality
 */
export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<number | null>(null);
  const minListeningTimeRef = useRef<number>(10000); // 10 seconds minimum listening time
  const startTimeRef = useRef<number>(0);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setHasRecognitionSupport(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      // Initialize speech recognition
      const initRecognition = () => {
        recognitionRef.current = new SpeechRecognition();
        
        if (recognitionRef.current) {
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-US';

          recognitionRef.current.onresult = (event) => {
            // Get the transcript from the results
            let currentTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
              const result = event.results[i];
              if (result[0] && result[0].transcript) {
                if (result.isFinal) {
                  finalTranscriptRef.current += result[0].transcript + ' ';
                } else {
                  currentTranscript += result[0].transcript;
                }
              }
            }
            
            // Update the transcript with both final and interim results
            const fullTranscript = finalTranscriptRef.current + currentTranscript;
            setTranscript(fullTranscript);
            setIsProcessingVoice(true);
          };

          recognitionRef.current.onend = () => {
            const elapsedTime = Date.now() - startTimeRef.current;
            
            // If we haven't reached the minimum listening time, restart recognition
            if (isListening && elapsedTime < minListeningTimeRef.current) {
              console.log(`Restarting recognition after ${elapsedTime}ms (minimum: ${minListeningTimeRef.current}ms)`);
              try {
                recognitionRef.current?.start();
              } catch (error) {
                console.error('Error restarting speech recognition:', error);
                // If there's an error, wait a bit and try again
                setTimeout(() => {
                  try {
                    recognitionRef.current?.start();
                  } catch (innerError) {
                    console.error('Failed to restart speech recognition:', innerError);
                    setIsListening(false);
                    setIsProcessingVoice(false);
                  }
                }, 100);
              }
            } else {
              setIsListening(false);
              // Keep processing state for a short time to show transition
              setTimeout(() => setIsProcessingVoice(false), 500);
            }
          };

          recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            
            // Don't stop listening on no-speech error, just restart
            if (event.error === 'no-speech') {
              if (isListening) {
                try {
                  recognitionRef.current?.stop();
                  setTimeout(() => {
                    try {
                      recognitionRef.current?.start();
                    } catch (error) {
                      console.error('Failed to restart after no-speech error:', error);
                    }
                  }, 100);
                } catch (error) {
                  console.error('Error handling no-speech error:', error);
                }
              }
            } else {
              setIsListening(false);
              setIsProcessingVoice(false);
            }
          };

          recognitionRef.current.onspeechstart = () => {
            setIsProcessingVoice(true);
            console.log('Speech started');
          };

          recognitionRef.current.onspeechend = () => {
            console.log('Speech ended');
            // Don't immediately end processing - we might restart recognition
          };
        }
      };

      // Initialize recognition on mount
      initRecognition();
    }

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const startListening = () => {
    // Reset transcript and state
    finalTranscriptRef.current = '';
    setTranscript('');
    setIsProcessingVoice(false);
    
    if (recognitionRef.current) {
      try {
        // Record start time for minimum duration tracking
        startTimeRef.current = Date.now();
        
        // Start recognition
        recognitionRef.current.start();
        setIsListening(true);
        
        // Set a timer to automatically stop after a reasonable maximum time
        // This prevents endless listening if the user forgets to stop
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        
        timerRef.current = window.setTimeout(() => {
          if (isListening) {
            stopListening();
          }
        }, 60000); // Maximum 60 seconds of listening
        
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        
        // If already started, stop and restart
        if (error instanceof DOMException && error.name === 'InvalidStateError') {
          try {
            recognitionRef.current.stop();
            setTimeout(() => {
              try {
                startTimeRef.current = Date.now();
                recognitionRef.current?.start();
                setIsListening(true);
              } catch (innerError) {
                console.error('Failed to restart speech recognition:', innerError);
              }
            }, 100);
          } catch (stopError) {
            console.error('Error stopping speech recognition before restart:', stopError);
          }
        }
      }
    }
  };

  const stopListening = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        // If stopping fails, try to abort instead
        try {
          recognitionRef.current.abort();
        } catch (abortError) {
          console.error('Error aborting speech recognition:', abortError);
        }
      }
      
      setIsListening(false);
      
      // Keep processing state for a short time to show transition
      setTimeout(() => setIsProcessingVoice(false), 500);
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    isProcessingVoice
  };
}; 