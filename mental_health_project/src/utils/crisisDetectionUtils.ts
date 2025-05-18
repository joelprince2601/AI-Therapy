import { useState, useEffect } from 'react';

// Crisis phrases to detect
const CRISIS_PHRASES = [
  // Suicide-related
  "kill myself", "end my life", "suicide", "suicidal", "don't want to live", "want to die",
  "better off dead", "take my own life", "ending it all", "no reason to live",
  
  // Self-harm
  "hurt myself", "self harm", "cutting myself", "harming myself", "injure myself",
  
  // Severe distress
  "can't take it anymore", "no way out", "unbearable pain", "hopeless",
  "no future", "giving up", "lost all hope",
  
  // Crisis
  "emergency", "crisis", "urgent help", "immediate danger",
  
  // Specific plans
  "overdose", "jump off", "hang myself", "pills", "gun"
];

// Function to detect crisis phrases in text
export function detectCrisisPhrases(text: string): string | null {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  
  // Check for crisis phrases
  for (const phrase of CRISIS_PHRASES) {
    if (lowerText.includes(phrase)) {
      return phrase;
    }
  }
  
  return null;
}

// Custom hook for crisis detection
export function useCrisisDetection() {
  const [isCrisisDetected, setIsCrisisDetected] = useState(false);
  const [crisisPhrase, setCrisisPhrase] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const checkMessage = (message: string) => {
    const detectedPhrase = detectCrisisPhrases(message);
    
    if (detectedPhrase) {
      setCrisisPhrase(detectedPhrase);
      setIsCrisisDetected(true);
      setShowModal(true);
      return true;
    }
    
    return false;
  };
  
  const resetCrisisState = () => {
    setIsCrisisDetected(false);
    setCrisisPhrase(null);
    setShowModal(false);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };
  
  return {
    isCrisisDetected,
    crisisPhrase,
    showModal,
    checkMessage,
    resetCrisisState,
    closeModal
  };
}

// Function to get appropriate crisis response for AI
export function getCrisisResponse(phrase: string | null): string {
  if (!phrase) return "";
  
  const responses = [
    "I notice you mentioned something concerning. Your wellbeing is important, and I want to make sure you're safe.",
    "I'm showing you some resources that might help. These are trained professionals who can provide better support than I can.",
    "Please consider reaching out to one of these services - they're available 24/7 and are trained to help with exactly what you're going through.",
    "You're not alone in this, and support is available."
  ];
  
  return responses.join(" ");
} 