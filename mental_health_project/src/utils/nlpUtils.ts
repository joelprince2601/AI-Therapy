/**
 * NLP Utilities for advanced text analysis and machine learning
 */

// Types for NLP analysis
export interface SentimentAnalysis {
  score: number; // -1 to 1 (negative to positive)
  magnitude: number; // 0 to +inf (strength of emotion)
  label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
}

export interface EntityAnalysis {
  name: string;
  type: 'PERSON' | 'LOCATION' | 'ORGANIZATION' | 'EVENT' | 'DATE' | 'CONSUMER_GOOD' | 'OTHER';
  salience: number; // 0-1 importance in text
  mentions: number;
}

export interface KeyPhraseAnalysis {
  phrase: string;
  score: number; // 0-1 relevance
}

export interface UserProfile {
  personalityTraits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  values: {
    [key: string]: number; // value name -> importance (0-1)
  };
  interests: {
    [key: string]: number; // interest name -> level (0-1)
  };
  concerns: {
    [key: string]: number; // concern name -> level (0-1)
  };
  communicationStyle: {
    verbose: number;
    emotional: number;
    analytical: number;
    concrete: number;
    abstract: number;
  };
  learningHistory: {
    topicsDiscussed: string[];
    insightsGained: string[];
    techniquesLearned: string[];
  };
}

export interface NLPAnalysisResult {
  sentiment: SentimentAnalysis;
  entities: EntityAnalysis[];
  keyPhrases: KeyPhraseAnalysis[];
  tokenCount: number;
  complexity: number; // 0-1 linguistic complexity
  topics: string[];
  emotions: {
    [key: string]: number; // emotion -> intensity (0-1)
  };
}

// Initialize a new user profile
export const createInitialUserProfile = (): UserProfile => ({
  personalityTraits: {
    openness: 0.5,
    conscientiousness: 0.5,
    extraversion: 0.5,
    agreeableness: 0.5,
    neuroticism: 0.5,
  },
  values: {},
  interests: {},
  concerns: {},
  communicationStyle: {
    verbose: 0.5,
    emotional: 0.5,
    analytical: 0.5,
    concrete: 0.5,
    abstract: 0.5,
  },
  learningHistory: {
    topicsDiscussed: [],
    insightsGained: [],
    techniquesLearned: [],
  },
});

// Simple sentiment analysis (without external API)
export const analyzeSentiment = (text: string): SentimentAnalysis => {
  // Positive and negative word lists (simplified)
  const positiveWords = [
    'good', 'great', 'happy', 'positive', 'excellent', 'wonderful', 'joy', 
    'love', 'hope', 'excited', 'grateful', 'thankful', 'appreciate',
    'better', 'calm', 'peaceful', 'relaxed', 'confident', 'proud'
  ];
  
  const negativeWords = [
    'bad', 'sad', 'angry', 'negative', 'terrible', 'horrible', 'awful',
    'hate', 'fear', 'worried', 'anxious', 'depressed', 'stressed',
    'worse', 'upset', 'frustrated', 'annoyed', 'disappointed', 'hurt'
  ];
  
  const intensifiers = [
    'very', 'extremely', 'incredibly', 'really', 'so', 'absolutely',
    'completely', 'totally', 'utterly', 'thoroughly'
  ];
  
  const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
  let positiveCount = 0;
  let negativeCount = 0;
  let intensifierCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
    if (intensifiers.includes(word)) intensifierCount++;
  });
  
  // Calculate sentiment score (-1 to 1)
  const totalSentimentWords = positiveCount + negativeCount;
  const score = totalSentimentWords === 0 
    ? 0 
    : (positiveCount - negativeCount) / totalSentimentWords;
  
  // Calculate magnitude (strength of emotion)
  const magnitude = (totalSentimentWords / words.length) * (1 + (intensifierCount / words.length));
  
  // Determine sentiment label
  let label: SentimentAnalysis['label'] = 'neutral';
  if (score <= -0.6) label = 'very_negative';
  else if (score <= -0.2) label = 'negative';
  else if (score >= 0.6) label = 'very_positive';
  else if (score >= 0.2) label = 'positive';
  
  return { score, magnitude, label };
};

// Extract key entities from text
export const extractEntities = (text: string): EntityAnalysis[] => {
  const entities: EntityAnalysis[] = [];
  const words = text.match(/\b(\w+)\b/g) || [];
  const wordFrequency: {[key: string]: number} = {};
  
  // Count word frequency
  words.forEach(word => {
    const normalized = word.toLowerCase();
    if (normalized.length > 3) { // Ignore short words
      wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
    }
  });
  
  // Find potential entities (proper nouns)
  const properNouns = text.match(/\b[A-Z][a-z]+\b/g) || [];
  properNouns.forEach(noun => {
    if (noun.length > 1) {
      const existingEntity = entities.find(e => e.name.toLowerCase() === noun.toLowerCase());
      if (existingEntity) {
        existingEntity.mentions++;
        existingEntity.salience = Math.min(existingEntity.salience + 0.1, 1);
      } else {
        entities.push({
          name: noun,
          type: 'PERSON', // Default assumption
          salience: 0.5,
          mentions: 1
        });
      }
    }
  });
  
  // Sort by mentions and limit to top 5
  return entities.sort((a, b) => b.mentions - a.mentions).slice(0, 5);
};

// Extract key phrases from text
export const extractKeyPhrases = (text: string): KeyPhraseAnalysis[] => {
  const phrases: KeyPhraseAnalysis[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  sentences.forEach(sentence => {
    const words = sentence.trim().split(/\s+/);
    if (words.length >= 3 && words.length <= 10) {
      // Consider medium length sentences as potential key phrases
      phrases.push({
        phrase: sentence.trim(),
        score: 0.5 + (Math.random() * 0.3) // Simple random scoring for demonstration
      });
    }
  });
  
  // Sort by score and limit to top 3
  return phrases.sort((a, b) => b.score - a.score).slice(0, 3);
};

// Detect emotions in text
export const detectEmotions = (text: string): {[key: string]: number} => {
  const lowerText = text.toLowerCase();
  const emotions: {[key: string]: number} = {
    anxiety: 0,
    sadness: 0,
    anger: 0,
    fear: 0,
    joy: 0,
    surprise: 0,
    disgust: 0,
    trust: 0
  };
  
  // Emotion word lists
  const emotionWords: {[key: string]: string[]} = {
    anxiety: ['anxious', 'nervous', 'worry', 'stress', 'overwhelm', 'panic', 'afraid', 'uneasy'],
    sadness: ['sad', 'depressed', 'unhappy', 'miserable', 'heartbroken', 'down', 'blue', 'grief'],
    anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'enraged', 'hostile'],
    fear: ['scared', 'afraid', 'terrified', 'frightened', 'fearful', 'panicked', 'alarmed'],
    joy: ['happy', 'joyful', 'excited', 'delighted', 'pleased', 'glad', 'cheerful', 'content'],
    surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'unexpected'],
    disgust: ['disgusted', 'revolted', 'repulsed', 'sickened', 'appalled', 'horrified'],
    trust: ['trust', 'believe', 'confident', 'faith', 'assured', 'certain', 'reliance']
  };
  
  // Check for emotion words
  Object.entries(emotionWords).forEach(([emotion, words]) => {
    words.forEach(word => {
      if (lowerText.includes(word)) {
        emotions[emotion] += 0.2;
      }
    });
    // Cap at 1.0
    emotions[emotion] = Math.min(emotions[emotion], 1);
  });
  
  return emotions;
};

// Perform comprehensive NLP analysis
export const analyzeText = (text: string): NLPAnalysisResult => {
  const sentiment = analyzeSentiment(text);
  const entities = extractEntities(text);
  const keyPhrases = extractKeyPhrases(text);
  const emotions = detectEmotions(text);
  
  // Calculate text complexity (simple heuristic)
  const words = text.split(/\s+/);
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = words.length / (sentences.length || 1);
  
  // Complexity score between 0-1
  const complexity = Math.min(
    ((avgWordLength - 3) / 3) * 0.5 + ((avgSentenceLength - 5) / 15) * 0.5,
    1
  );
  
  // Extract topics using keywords
  const topics = extractTopics(text);
  
  return {
    sentiment,
    entities,
    keyPhrases,
    tokenCount: words.length,
    complexity: Math.max(0, complexity),
    topics,
    emotions
  };
};

// Extract topics from text
export const extractTopics = (text: string): string[] => {
  const topics: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Topic keyword mapping
  const topicKeywords: {[key: string]: string[]} = {
    'work': ['work', 'job', 'career', 'boss', 'office', 'colleague', 'profession', 'employment'],
    'relationships': ['relationship', 'partner', 'marriage', 'dating', 'spouse', 'boyfriend', 'girlfriend'],
    'family': ['family', 'parent', 'child', 'mother', 'father', 'sister', 'brother', 'son', 'daughter'],
    'health': ['health', 'illness', 'disease', 'doctor', 'hospital', 'pain', 'symptom', 'diagnosis'],
    'mental health': ['anxiety', 'depression', 'therapy', 'counseling', 'mental', 'psychiatrist', 'psychologist'],
    'finance': ['money', 'finance', 'debt', 'budget', 'saving', 'expense', 'income', 'investment'],
    'education': ['school', 'college', 'university', 'degree', 'study', 'learn', 'education', 'student'],
    'housing': ['home', 'house', 'apartment', 'rent', 'mortgage', 'roommate', 'living situation'],
    'self-improvement': ['goal', 'improvement', 'growth', 'development', 'progress', 'better', 'skill'],
    'social life': ['friend', 'social', 'party', 'gathering', 'community', 'connection', 'loneliness']
  };
  
  // Check for topic keywords
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      topics.push(topic);
    }
  });
  
  return topics;
};

// Update user profile based on new text analysis
export const updateUserProfile = (
  currentProfile: UserProfile,
  textAnalysis: NLPAnalysisResult,
  userText: string
): UserProfile => {
  const updatedProfile = { ...currentProfile };
  
  // Update communication style
  updatedProfile.communicationStyle.verbose = 
    weightedAverage(
      currentProfile.communicationStyle.verbose,
      textAnalysis.tokenCount > 100 ? 0.8 : textAnalysis.tokenCount > 50 ? 0.5 : 0.2
    );
    
  updatedProfile.communicationStyle.emotional = 
    weightedAverage(
      currentProfile.communicationStyle.emotional,
      textAnalysis.sentiment.magnitude > 0.7 ? 0.8 : textAnalysis.sentiment.magnitude > 0.3 ? 0.5 : 0.2
    );
    
  updatedProfile.communicationStyle.analytical = 
    weightedAverage(
      currentProfile.communicationStyle.analytical,
      textAnalysis.complexity > 0.7 ? 0.8 : textAnalysis.complexity > 0.4 ? 0.5 : 0.2
    );
  
  // Update interests based on topics
  textAnalysis.topics.forEach(topic => {
    if (!updatedProfile.interests[topic]) {
      updatedProfile.interests[topic] = 0.6; // Initial interest level
    } else {
      updatedProfile.interests[topic] = weightedAverage(updatedProfile.interests[topic], 0.8);
    }
  });
  
  // Update concerns based on negative emotions
  Object.entries(textAnalysis.emotions).forEach(([emotion, intensity]) => {
    if (intensity > 0.5 && ['anxiety', 'sadness', 'anger', 'fear', 'disgust'].includes(emotion)) {
      if (!updatedProfile.concerns[emotion]) {
        updatedProfile.concerns[emotion] = intensity;
      } else {
        updatedProfile.concerns[emotion] = weightedAverage(updatedProfile.concerns[emotion], intensity);
      }
    }
  });
  
  // Update personality traits (very simplified)
  if (textAnalysis.sentiment.score > 0.5) {
    updatedProfile.personalityTraits.extraversion = 
      weightedAverage(updatedProfile.personalityTraits.extraversion, 0.6);
    updatedProfile.personalityTraits.agreeableness = 
      weightedAverage(updatedProfile.personalityTraits.agreeableness, 0.6);
  }
  
  if (textAnalysis.complexity > 0.6) {
    updatedProfile.personalityTraits.openness = 
      weightedAverage(updatedProfile.personalityTraits.openness, 0.7);
  }
  
  // Update learning history
  textAnalysis.topics.forEach(topic => {
    if (!updatedProfile.learningHistory.topicsDiscussed.includes(topic)) {
      updatedProfile.learningHistory.topicsDiscussed.push(topic);
    }
  });
  
  return updatedProfile;
};

// Helper function for weighted average
const weightedAverage = (currentValue: number, newValue: number, weight: number = 0.3): number => {
  return currentValue * (1 - weight) + newValue * weight;
};

// Generate personalized therapeutic response based on user profile and text analysis
export const generatePersonalizedResponse = async (
  userInput: string,
  userProfile: UserProfile,
  textAnalysis: NLPAnalysisResult | null,
  conversationHistory: any[] = []
): Promise<string> => {
  // If no analysis is available, return a generic response
  if (!textAnalysis) {
    const genericResponses = [
      "Thank you for sharing that. Could you tell me more about how that makes you feel?",
      "I appreciate you opening up. What thoughts come up for you when you reflect on this?",
      "I'm here to listen. How has this been affecting your daily life?",
      "Thank you for expressing that. What would be most helpful for us to explore about this today?"
    ];
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }
  
  // Create a base response based on the detected emotions and topics
  let baseResponse = "";
  
  // Respond to emotional content
  const primaryEmotion = Object.entries(textAnalysis.emotions)
    .sort(([_, a], [__, b]) => b - a)[0];
    
  if (primaryEmotion && primaryEmotion[1] > 0.4) {
    switch(primaryEmotion[0]) {
      case 'anxiety':
        baseResponse = "I can hear that anxiety is present for you right now. It's a natural response, though it can certainly be uncomfortable.";
        break;
      case 'sadness':
        baseResponse = "I'm noticing a sense of sadness in what you're sharing. These feelings are important to acknowledge.";
        break;
      case 'anger':
        baseResponse = "I can sense some frustration or anger in your message. These are valid emotions that often have important messages for us.";
        break;
      case 'fear':
        baseResponse = "It sounds like there's some fear or worry in what you're experiencing. That's completely understandable.";
        break;
      case 'joy':
        baseResponse = "I notice a positive feeling in what you're sharing. It's wonderful to recognize these moments.";
        break;
      default:
        baseResponse = "Thank you for sharing how you're feeling. Your emotions provide valuable insight.";
    }
  } else {
    baseResponse = "Thank you for sharing that with me. I'm here to listen and support you.";
  }
  
  // Add a reflection based on the content
  if (textAnalysis.topics.length > 0) {
    baseResponse += ` I notice you mentioned ${textAnalysis.topics[0]}. `;
    
    // Add topic-specific reflection
    switch(textAnalysis.topics[0]) {
      case 'work':
        baseResponse += "Our work lives can significantly impact our wellbeing. How has this been affecting you?";
        break;
      case 'relationships':
        baseResponse += "Relationships can be both fulfilling and challenging. How are you navigating this situation?";
        break;
      case 'family':
        baseResponse += "Family dynamics can be complex. How are you feeling about this aspect of your life?";
        break;
      case 'health':
        baseResponse += "Health concerns can be stressful. How are you taking care of yourself during this time?";
        break;
      default:
        baseResponse += "How has this been impacting you lately?";
    }
  }
  
  // Adjust response based on communication style
  if (userProfile.communicationStyle.verbose > 0.7) {
    // For verbose users, provide more detailed responses
    baseResponse = expandResponse(baseResponse);
  } else if (userProfile.communicationStyle.verbose < 0.3) {
    // For concise users, provide more concise responses
    baseResponse = condenseResponse(baseResponse);
  }
  
  // Adjust emotional tone based on user's emotional state
  if (textAnalysis.emotions.anxiety > 0.6 || textAnalysis.emotions.fear > 0.6) {
    baseResponse = addReassurance(baseResponse);
  }
  
  if (textAnalysis.emotions.sadness > 0.6) {
    baseResponse = addValidation(baseResponse);
  }
  
  // Reference user's interests or concerns if relevant
  const highInterests = Object.entries(userProfile.interests)
    .filter(([_, value]) => value > 0.7)
    .map(([key]) => key);
    
  if (highInterests.length > 0 && Math.random() > 0.7) {
    baseResponse = addInterestReference(baseResponse, highInterests[0]);
  }
  
  return baseResponse;
};

// Helper functions for response modification
const expandResponse = (response: string): string => {
  const sentences = response.split(/[.!?] /);
  if (sentences.length < 2) return response;
  
  // Add an elaboration to one of the sentences
  const elaborations = [
    "This is particularly important to consider in your situation.",
    "Many people find this perspective helpful when navigating similar challenges.",
    "Taking time to reflect on this can reveal valuable insights.",
    "This approach is supported by research in therapeutic practice."
  ];
  
  const randomIndex = Math.floor(Math.random() * (sentences.length - 1));
  const randomElaboration = elaborations[Math.floor(Math.random() * elaborations.length)];
  
  sentences[randomIndex] = sentences[randomIndex] + ". " + randomElaboration;
  return sentences.join(". ");
};

const condenseResponse = (response: string): string => {
  // Remove any filler phrases
  const fillerPhrases = [
    /\bAs we discussed earlier\b/g,
    /\bIt's worth noting that\b/g,
    /\bIn my experience\b/g,
    /\bGenerally speaking\b/g,
    /\bAs you may know\b/g
  ];
  
  let condensed = response;
  fillerPhrases.forEach(phrase => {
    condensed = condensed.replace(phrase, '');
  });
  
  return condensed.replace(/\s+/g, ' ').trim();
};

const addReassurance = (response: string): string => {
  const reassurances = [
    "Remember that these feelings will pass with time.",
    "Many people experience similar concerns, and there are effective ways to manage them.",
    "You're taking an important step just by reflecting on these thoughts.",
    "We can work through this together at a pace that feels comfortable for you."
  ];
  
  const randomReassurance = reassurances[Math.floor(Math.random() * reassurances.length)];
  return response + " " + randomReassurance;
};

const addValidation = (response: string): string => {
  const validations = [
    "It's completely understandable to feel this way given what you're experiencing.",
    "Your feelings are valid and important to acknowledge.",
    "Many would feel similarly in your situation.",
    "It takes courage to express these feelings."
  ];
  
  const randomValidation = validations[Math.floor(Math.random() * validations.length)];
  return response + " " + randomValidation;
};

const addInterestReference = (response: string, interest: string): string => {
  const references: {[key: string]: string[]} = {
    'work': [
      "This might relate to your work situation as well.",
      "You might find similar patterns in your professional life.",
    ],
    'relationships': [
      "This perspective could be valuable in your relationships too.",
      "Similar principles might apply in your interpersonal connections.",
    ],
    'family': [
      "This may resonate with your family experiences as well.",
      "Your family dynamics might benefit from a similar approach.",
    ],
    'health': [
      "This connects to overall wellbeing, including the health concerns you've mentioned.",
      "This approach supports both mental and physical health goals.",
    ],
    'mental health': [
      "This is particularly relevant to the mental health journey you're on.",
      "Many find this helpful in managing their emotional wellbeing.",
    ]
  };
  
  if (references[interest]) {
    const randomReference = references[interest][Math.floor(Math.random() * references[interest].length)];
    return response + " " + randomReference;
  }
  
  return response;
}; 