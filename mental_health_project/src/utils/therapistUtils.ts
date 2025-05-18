import { Message } from '../hooks/useConversation';
import { 
  analyzeText, 
  NLPAnalysisResult, 
  UserProfile, 
  createInitialUserProfile,
  generatePersonalizedResponse,
  updateUserProfile
} from './nlpUtils';
import {
  enhanceResponseWithExternalData,
  containsCrisisIndicators
} from './apiUtils';
import {
  sendLlamaRequest,
  LlamaMessage,
  createTherapySystemPrompt
} from './llamaApiUtils';

// Therapy approach types
type TherapyApproach = 'cbt' | 'mindfulness' | 'supportive' | 'solution-focused' | 'existential';

// Emotion categories for tracking user emotional state
type EmotionCategory = 'anxiety' | 'depression' | 'anger' | 'grief' | 'joy' | 'confusion' | 'neutral';

// Therapy session state to track conversation context
export interface TherapySessionState {
  dominantEmotions: EmotionCategory[];
  recentTopics: string[];
  approachUsed: TherapyApproach[];
  questionTypes: string[];
  sessionDepth: number; // Increases as conversation progresses
  crisisDetected: boolean;
  lastQuestionType: string;
  userInsights: string[];
  userProfile: UserProfile; // Added user profile from NLP analysis
  lastAnalysis: NLPAnalysisResult | null; // Store last analysis results
}

// Initialize a new therapy session state
export const createInitialSessionState = (): TherapySessionState => ({
  dominantEmotions: ['neutral'],
  recentTopics: [],
  approachUsed: ['supportive'],
  questionTypes: [],
  sessionDepth: 0,
  crisisDetected: false,
  lastQuestionType: 'opening',
  userInsights: [],
  userProfile: createInitialUserProfile(),
  lastAnalysis: null
});

// Detect emotions from user text - now using NLP analysis
export const detectEmotions = (text: string): EmotionCategory[] => {
  // Perform NLP analysis to get emotions
  const analysis = analyzeText(text);
  const emotions = analysis.emotions;
  
  // Map NLP emotions to therapy emotion categories
  const result: EmotionCategory[] = [];
  
  if (emotions.anxiety > 0.4) result.push('anxiety');
  if (emotions.sadness > 0.4) result.push('depression');
  if (emotions.anger > 0.4) result.push('anger');
  if (emotions.joy > 0.4) result.push('joy');
  
  // Check for grief indicators separately
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes('grief') || 
    lowerText.includes('loss') || 
    lowerText.includes('miss') || 
    lowerText.includes('gone') || 
    lowerText.includes('died') ||
    lowerText.includes('death')
  ) {
    result.push('grief');
  }
  
  // Check for confusion
  if (emotions.surprise > 0.4 || lowerText.includes('confus') || lowerText.includes('unsure')) {
    result.push('confusion');
  }
  
  // Default to neutral if no emotions detected
  if (result.length === 0) {
    result.push('neutral');
  }
  
  return result;
};

// Detect potential crisis situations - now using apiUtils
export const detectCrisis = (text: string): boolean => {
  return containsCrisisIndicators(text);
};

// Extract potential topics from user text - now using NLP analysis
export const extractTopics = (text: string): string[] => {
  // Use the NLP topic extraction
  const analysis = analyzeText(text);
  return analysis.topics;
};

// Generate therapeutic questions based on conversation context
const generateTherapeuticQuestion = (
  sessionState: TherapySessionState,
  latestEmotion: EmotionCategory,
  latestTopic: string | null
): string => {
  // Crisis response takes precedence
  if (sessionState.crisisDetected) {
    return "I'm concerned about what you're sharing. Would you be willing to reach out to a crisis helpline right now? The National Suicide Prevention Lifeline is available 24/7 at 988 or 1-800-273-8255. Would it be okay if we focused on keeping you safe right now?";
  }

  // Question types to cycle through
  const questionTypes = [
    'emotion-exploration',
    'thought-patterns',
    'coping-strategies',
    'values-exploration',
    'behavioral-patterns',
    'future-oriented',
    'meaning-making',
    'social-support',
    'self-compassion'
  ];
  
  // Avoid repeating the last question type
  const availableTypes = questionTypes.filter(type => type !== sessionState.lastQuestionType);
  const questionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  
  // Generate question based on type, emotion, and topic
  let question = '';
  
  // Use user profile to personalize questions if available
  const userProfile = sessionState.userProfile;
  
  switch (questionType) {
    case 'emotion-exploration':
      if (latestEmotion === 'anxiety') {
        question = "When you notice this anxiety rising, where do you feel it in your body? What sensations are present?";
      } else if (latestEmotion === 'depression') {
        question = "When these feelings of sadness come up, what thoughts typically accompany them?";
      } else if (latestEmotion === 'anger') {
        question = "Underneath this anger, are there other emotions present that might be harder to access?";
      } else if (latestEmotion === 'grief') {
        question = "What aspects of this loss feel most difficult to process right now?";
      } else if (latestEmotion === 'joy') {
        question = "What does this moment of joy teach you about what matters most to you?";
      } else if (latestEmotion === 'confusion') {
        question = "When you sit with this uncertainty, what possibilities start to emerge?";
      } else {
        question = "What emotions have been most present for you lately?";
      }
      break;
      
    case 'thought-patterns':
      if (latestTopic === 'work') {
        question = "What expectations do you hold about your work that might be contributing to how you're feeling?";
      } else if (latestTopic === 'relationships' || latestTopic === 'family') {
        question = "Are there any recurring thoughts or assumptions about relationships that might be influencing your perspective?";
      } else if (latestTopic === 'self-esteem') {
        question = "If you were to write down the core beliefs you hold about yourself, what would they be?";
      } else {
        question = "Have you noticed any patterns in your thinking that seem to intensify difficult emotions?";
      }
      break;
      
    case 'coping-strategies':
      question = "What has helped you navigate similar situations or feelings in the past?";
      if (latestEmotion === 'anxiety') {
        question = "When anxiety feels overwhelming, what strategies have you found most helpful for grounding yourself?";
      } else if (latestEmotion === 'depression') {
        question = "On days when motivation is low, what small actions have helped you move forward?";
      }
      break;
      
    case 'values-exploration':
      question = "What matters most to you in this situation? What core values are guiding you?";
      if (latestTopic === 'work') {
        question = "What aspects of your work align with your personal values, and where do you feel disconnection?";
      } else if (latestTopic === 'relationships') {
        question = "In your relationships, what qualities do you value most?";
      }
      break;
      
    case 'behavioral-patterns':
      question = "How do these feelings typically influence your actions? What patterns have you noticed?";
      break;
      
    case 'future-oriented':
      question = "If you were to imagine this situation resolved in a way that feels right to you, what would that look like?";
      break;
      
    case 'meaning-making':
      question = "How has this experience shaped your understanding of yourself or your life?";
      break;
      
    case 'social-support':
      question = "Who in your life helps you feel understood and supported? How might they be able to support you now?";
      break;
      
    case 'self-compassion':
      question = "What would you say to a friend facing a similar situation? Could you offer yourself the same kindness?";
      break;
      
    default:
      question = "What feels most important for us to explore today?";
  }
  
  return question;
};

// Update session state with user input - enhanced with NLP analysis
export const updateSessionState = (
  currentState: TherapySessionState,
  userInput: string
): TherapySessionState => {
  // Create a new state object to avoid mutation
  const newState = { ...currentState };
  
  // Perform NLP analysis on user input
  const textAnalysis = analyzeText(userInput);
  
  // Update user profile with new analysis
  const updatedProfile = updateUserProfile(
    currentState.userProfile,
    textAnalysis,
    userInput
  );
  
  // Detect emotions and crisis indicators
  const emotions = detectEmotions(userInput);
  const isCrisis = detectCrisis(userInput);
  
  // Extract topics
  const topics = extractTopics(userInput);
  
  // Update session state
  newState.dominantEmotions = emotions;
  newState.crisisDetected = isCrisis;
  newState.sessionDepth += 1;
  newState.userProfile = updatedProfile;
  newState.lastAnalysis = textAnalysis;
  
  // Add new topics to recent topics (keep only most recent 3)
  newState.recentTopics = [...topics, ...currentState.recentTopics].slice(0, 3);
  
  // Select therapy approach based on detected emotions and topics
  if (emotions.includes('anxiety')) {
    newState.approachUsed = ['cbt', 'mindfulness'];
  } else if (emotions.includes('depression')) {
    newState.approachUsed = ['cbt', 'supportive'];
  } else if (emotions.includes('grief')) {
    newState.approachUsed = ['supportive', 'existential'];
  } else if (emotions.includes('confusion')) {
    newState.approachUsed = ['solution-focused', 'existential'];
  } else {
    // Default approach
    newState.approachUsed = ['supportive', 'solution-focused'];
  }
  
  return newState;
};

// Resource generation functions
interface Resource {
  type: 'quote' | 'breathing' | 'mindfulness' | 'coping' | 'resource';
  content: string;
  title?: string;
  source?: string;
  url?: string;
}

// Generate an inspirational quote
export const generateQuote = (): Resource => {
  const quotes = [
    { content: "You don't have to control your thoughts. You just have to stop letting them control you.", source: "Dan Millman" },
    { content: "You are not your illness. You have an individual story to tell. You have a name, a history, a personality. Staying yourself is part of the battle.", source: "Julian Seifter" },
    { content: "There is hope, even when your brain tells you there isn't.", source: "John Green" },
    { content: "Promise me you'll always remember: You're braver than you believe, stronger than you seem, and smarter than you think.", source: "A.A. Milne" },
    { content: "You are not a drop in the ocean. You are the entire ocean in a drop.", source: "Rumi" },
    { content: "The greatest glory in living lies not in never falling, but in rising every time we fall.", source: "Nelson Mandela" },
    { content: "Your present circumstances don't determine where you can go; they merely determine where you start.", source: "Nido Qubein" },
    { content: "Nothing is impossible. The word itself says 'I'm possible!'", source: "Audrey Hepburn" },
    { content: "In the middle of difficulty lies opportunity.", source: "Albert Einstein" },
    { content: "Self-care is not self-indulgence, it is self-preservation.", source: "Audre Lorde" },
    { content: "You are allowed to take up space. You are allowed to have a voice. You are allowed to tell people how you feel.", source: "Megan Jayne Crabbe" },
    { content: "The way I see it, if you want the rainbow, you gotta put up with the rain.", source: "Dolly Parton" },
    { content: "Sometimes the bravest and most important thing you can do is just show up.", source: "Brené Brown" },
    { content: "What mental health needs is more sunlight, more candor, and more unashamed conversation.", source: "Glenn Close" },
    { content: "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.", source: "J.K. Rowling" }
  ];

  return {
    type: 'quote',
    ...quotes[Math.floor(Math.random() * quotes.length)]
  };
};

// Generate a breathing exercise
export const generateBreathingExercise = (): Resource => {
  const exercises = [
    {
      title: "4-7-8 Breathing",
      content: "Find a comfortable position. Inhale quietly through your nose for 4 seconds. Hold your breath for 7 seconds. Exhale completely through your mouth for 8 seconds, making a whoosh sound. Repeat this cycle 4 times."
    },
    {
      title: "Box Breathing",
      content: "Inhale slowly through your nose for 4 seconds. Hold your breath for 4 seconds. Exhale through your mouth for 4 seconds. Hold your breath for 4 seconds. Repeat this square pattern for 1-2 minutes."
    },
    {
      title: "Diaphragmatic Breathing",
      content: "Place one hand on your chest and the other on your abdomen. Breathe in slowly through your nose, feeling your abdomen expand (not your chest). Exhale slowly through pursed lips. Focus on the movement of your abdomen rather than your chest."
    },
    {
      title: "Alternate Nostril Breathing",
      content: "Use your right thumb to close your right nostril. Inhale deeply through your left nostril. Close your left nostril with your ring finger, release your thumb, and exhale through your right nostril. Inhale through your right nostril, then close it, and exhale through your left. Repeat for 5-10 cycles."
    },
    {
      title: "Calming Breath",
      content: "Breathe in through your nose for 3 seconds. Breathe out through your mouth for 6 seconds (twice as long as the inhale). Focus on making your exhale slow and controlled. Continue for 2-3 minutes."
    }
  ];

  const exercise = exercises[Math.floor(Math.random() * exercises.length)];
  return {
    type: 'breathing',
    content: exercise.content,
    title: exercise.title
  };
};

// Generate a mindfulness practice
export const generateMindfulnessPractice = (): Resource => {
  const practices = [
    {
      title: "Body Scan",
      content: "Find a comfortable position sitting or lying down. Close your eyes and bring awareness to your body. Starting from your toes and moving upward, notice any sensations, tension, or discomfort in each part of your body. Don't try to change anything—simply observe with curiosity and without judgment."
    },
    {
      title: "Five Senses Grounding",
      content: "Take a moment to notice: 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This exercise helps bring you back to the present moment when feeling overwhelmed."
    },
    {
      title: "Mindful Walking",
      content: "Take a slow, deliberate walk. Pay attention to the sensation of your feet touching the ground, the movement of your legs, and your breathing. Notice the environment around you—colors, sounds, smells—without getting caught up in thoughts about them."
    },
    {
      title: "Loving-Kindness Meditation",
      content: "Close your eyes and bring to mind someone you care about. Silently repeat: 'May you be happy. May you be healthy. May you be safe. May you live with ease.' Then direct these wishes toward yourself, and gradually extend them to others, including those you find difficult."
    },
    {
      title: "Mindful Eating",
      content: "Choose a small piece of food (like a raisin or piece of chocolate). Examine it as if you've never seen it before. Notice its color, texture, and smell. Place it in your mouth without chewing, noticing the sensations. Slowly chew, fully experiencing the taste and texture."
    },
    {
      title: "Thought Clouds",
      content: "Imagine your thoughts as clouds passing across the sky of your mind. Don't try to push them away or hold onto them—simply observe them forming and dissolving. Notice the space between thoughts, the clear blue sky that's always present."
    }
  ];

  const practice = practices[Math.floor(Math.random() * practices.length)];
  return {
    type: 'mindfulness',
    content: practice.content,
    title: practice.title
  };
};

// Generate a coping strategy
export const generateCopingStrategy = (emotion?: EmotionCategory): Resource => {
  const strategies = {
    anxiety: [
      {
        title: "Progressive Muscle Relaxation",
        content: "Tense and then release each muscle group in your body, starting from your toes and working up to your head. Hold the tension for 5 seconds, then release for 10 seconds, noticing the difference between tension and relaxation."
      },
      {
        title: "Worry Time",
        content: "Schedule a specific 15-30 minute period each day as your 'worry time.' When worries arise outside this time, note them down and postpone thinking about them until your designated worry time. This helps contain anxiety to a specific timeframe."
      },
      {
        title: "Grounding Techniques",
        content: "When anxiety spikes, focus on concrete details in your environment. Name 5 blue things you can see, 4 textures you can feel, 3 sounds you can hear, 2 things you can smell, and 1 thing you can taste."
      }
    ],
    depression: [
      {
        title: "Behavioral Activation",
        content: "Make a list of activities that typically bring you joy or satisfaction. Choose one small activity each day and complete it, even when motivation is low. Notice any positive feelings, however small, that result from taking action."
      },
      {
        title: "Gratitude Practice",
        content: "Each evening, write down three specific things you're grateful for from that day. They can be as simple as 'the warm sunshine' or 'the taste of my morning coffee.' This helps shift attention toward positive aspects of life."
      },
      {
        title: "Movement for Mood",
        content: "Commit to just 5 minutes of physical movement. Walk around your home, stretch, or dance to one song. Movement releases endorphins that can help lift your mood, even when done in small amounts."
      }
    ],
    anger: [
      {
        title: "Timeout Technique",
        content: "When you notice anger rising, give yourself permission to take a timeout. Remove yourself from the triggering situation for at least 20 minutes (the time it takes for stress hormones to dissipate) before responding."
      },
      {
        title: "Physical Release",
        content: "Channel the physical energy of anger into a constructive activity: go for a run, punch a pillow, tear up paper, or squeeze a stress ball. This helps discharge the bodily tension that accompanies anger."
      },
      {
        title: "Anger Journaling",
        content: "Write uncensored thoughts about what's making you angry. Include what happened, your thoughts about it, and the emotions underneath your anger (often hurt, fear, or disappointment). This helps process anger rather than acting on it impulsively."
      }
    ],
    grief: [
      {
        title: "Memory Box",
        content: "Create a special container to hold meaningful items connected to your loss. Include photos, letters, or objects that hold significance. This provides a tangible way to honor your connection while containing grief in a designated space."
      },
      {
        title: "Grief Journaling",
        content: "Write letters to the person or thing you've lost. Share your feelings, things you wish you'd said, or updates about your life. This maintains a sense of connection while acknowledging the reality of the loss."
      },
      {
        title: "Grief Rituals",
        content: "Create a simple ritual to honor your loss—light a candle, visit a meaningful place, play a special song, or cook a favorite meal. Rituals provide structure for expressing grief and commemorating what matters to you."
      }
    ],
    neutral: [
      {
        title: "Values Reflection",
        content: "Take time to identify your core values—what matters most to you in life. Then reflect on one small action you could take today that aligns with these values. This builds a sense of meaning and purpose in everyday choices."
      },
      {
        title: "Mindful Moments",
        content: "Set reminders to take three mindful breaths throughout your day. During these brief pauses, simply notice your breath and bodily sensations, allowing yourself to fully arrive in the present moment before continuing your activities."
      },
      {
        title: "Strength Inventory",
        content: "Make a list of your personal strengths and resources—qualities, skills, supportive relationships, and past successes. Review this list regularly, especially when facing challenges, to remind yourself of your capacity for resilience."
      }
    ]
  };

  // Default to neutral if no emotion specified or if specified emotion isn't in our list
  const emotionToUse = emotion && strategies[emotion] ? emotion : 'neutral';
  
  const strategy = strategies[emotionToUse][Math.floor(Math.random() * strategies[emotionToUse].length)];
  return {
    type: 'coping',
    content: strategy.content,
    title: strategy.title
  };
};

// Generate a mental health resource
export const generateMentalHealthResource = (): Resource => {
  const resources = [
    {
      title: "Crisis Text Line",
      content: "Free 24/7 text-based mental health support and crisis intervention",
      url: "https://www.crisistextline.org/",
      contact: "Text HOME to 741741"
    },
    {
      title: "National Suicide Prevention Lifeline",
      content: "Free and confidential support for people in distress",
      url: "https://988lifeline.org/",
      contact: "Call or text 988"
    },
    {
      title: "SAMHSA's National Helpline",
      content: "Treatment referral and information service for individuals facing mental health or substance use disorders",
      url: "https://www.samhsa.gov/find-help/national-helpline",
      contact: "1-800-662-HELP (4357)"
    },
    {
      title: "Psychology Today Therapist Finder",
      content: "Directory to find therapists, psychiatrists, treatment centers and support groups near you",
      url: "https://www.psychologytoday.com/us/therapists"
    },
    {
      title: "MentalHealth.gov",
      content: "U.S. government information and resources on mental health",
      url: "https://www.mentalhealth.gov/"
    },
    {
      title: "National Alliance on Mental Illness (NAMI)",
      content: "Nation's largest grassroots mental health organization dedicated to building better lives for Americans affected by mental illness",
      url: "https://www.nami.org/",
      contact: "NAMI Helpline: 1-800-950-NAMI (6264)"
    },
    {
      title: "Headspace",
      content: "Meditation and mindfulness app with exercises for stress, anxiety, sleep, and focus",
      url: "https://www.headspace.com/"
    },
    {
      title: "Calm",
      content: "App for sleep, meditation and relaxation",
      url: "https://www.calm.com/"
    },
    {
      title: "7 Cups",
      content: "Online therapy and free emotional support",
      url: "https://www.7cups.com/"
    },
    {
      title: "Talkspace",
      content: "Online therapy platform connecting users with licensed therapists",
      url: "https://www.talkspace.com/"
    }
  ];

  const resource = resources[Math.floor(Math.random() * resources.length)];
  return {
    type: 'resource',
    content: resource.content,
    title: resource.title,
    url: resource.url,
    source: resource.contact
  };
};

// Select appropriate resource based on user's emotional state and therapy session
export const selectAppropriateResource = (
  sessionState: TherapySessionState, 
  messageCount: number
): Resource | null => {
  // Only start offering resources after a few messages
  if (messageCount < 3) return null;
  
  // Offer resources periodically (every 5-7 messages)
  if (messageCount % 6 !== 0) return null;
  
  const dominantEmotion = sessionState.dominantEmotions[0] || 'neutral';
  
  // Crisis situation - provide immediate resources
  if (sessionState.crisisDetected) {
    return generateMentalHealthResource();
  }
  
  // Select resource type based on context
  const resourceTypes = ['quote', 'breathing', 'mindfulness', 'coping', 'resource'];
  const randomFactor = Math.random();
  
  if (dominantEmotion === 'anxiety' && randomFactor < 0.6) {
    // Anxiety - breathing exercises and mindfulness are most helpful
    return Math.random() < 0.5 ? generateBreathingExercise() : generateMindfulnessPractice();
  } else if (dominantEmotion === 'depression' && randomFactor < 0.6) {
    // Depression - coping strategies and quotes can be motivating
    return Math.random() < 0.5 ? generateCopingStrategy('depression') : generateQuote();
  } else if (dominantEmotion === 'anger' && randomFactor < 0.6) {
    // Anger - breathing and coping strategies help
    return Math.random() < 0.5 ? generateBreathingExercise() : generateCopingStrategy('anger');
  } else if (dominantEmotion === 'grief' && randomFactor < 0.6) {
    // Grief - coping strategies specific to grief
    return generateCopingStrategy('grief');
  } else {
    // Random selection for other emotions or to provide variety
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    
    switch (resourceType) {
      case 'quote': return generateQuote();
      case 'breathing': return generateBreathingExercise();
      case 'mindfulness': return generateMindfulnessPractice();
      case 'coping': return generateCopingStrategy(dominantEmotion);
      case 'resource': return generateMentalHealthResource();
      default: return generateQuote();
    }
  }
};

// Format resource for display in message
export const formatResourceForMessage = (resource: Resource): string => {
  if (!resource) return '';
  
  let formattedResource = '';
  
  switch (resource.type) {
    case 'quote':
      formattedResource = `"${resource.content}" - ${resource.source}`;
      break;
    case 'breathing':
      formattedResource = `Breathing Exercise: ${resource.content}`;
      break;
    case 'mindfulness':
      formattedResource = `Mindfulness Practice - ${resource.title}:\n${resource.content}`;
      break;
    case 'coping':
      formattedResource = `Coping Strategy - ${resource.title}:\n${resource.content}`;
      break;
    case 'resource':
      formattedResource = `Resource: ${resource.title} - ${resource.content}\n${resource.url ? `Website: ${resource.url}` : ''}${resource.source ? `\nContact: ${resource.source}` : ''}`;
      break;
    default:
      return '';
  }
  
  return formattedResource;
};

// Update the generateTherapistResponse function to use Llama API
export const generateTherapistResponse = async (
  userInput: string,
  sessionState: TherapySessionState,
  conversationHistory: Message[]
): Promise<{ response: string; updatedState: TherapySessionState }> => {
  // Update session state with new user input
  const updatedState = updateSessionState(sessionState, userInput);
  
  // Check for crisis indicators first
  if (updatedState.crisisDetected) {
    const crisisResponse = "I'm concerned about what you're sharing. If you're in immediate danger, please call 988 or 911, or text HOME to 741741 to reach the Crisis Text Line. Your safety is the top priority. Would it be helpful to talk about some immediate coping strategies or resources available to you right now?";
    
    return {
      response: crisisResponse,
      updatedState
    };
  }

  try {
    // Convert conversation history to Llama message format
    const llamaMessages: LlamaMessage[] = [];
    
    // Add the last few messages for context (limit to 10 messages to avoid token limits)
    const recentMessages = conversationHistory.slice(-10);
    
    recentMessages.forEach(msg => {
      llamaMessages.push({
        role: msg.type === 'entry' ? 'user' : 'assistant',
        content: msg.text
      });
    });
    
    // Add the current user message
    llamaMessages.push({
      role: 'user',
      content: userInput
    });
    
    // Get system prompt
    const systemPrompt = createTherapySystemPrompt();
    
    // Send request to Llama API
    const response = await sendLlamaRequest(llamaMessages, systemPrompt);
    
    return {
      response,
      updatedState
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Fallback to basic response if API fails
    return {
      response: "I'm here to listen and support you. Could you tell me more about how you're feeling?",
      updatedState
    };
  }
};

// Get initial greeting message
export const getInitialGreeting = async (): Promise<string> => {
  try {
    // Use Llama API for the initial greeting
    const initialMessage: LlamaMessage = {
      role: 'user',
      content: 'Hello, I would like to start a therapy session.'
    };
    
    const systemPrompt = createTherapySystemPrompt();
    const response = await sendLlamaRequest([initialMessage], systemPrompt);
    
    return response;
  } catch (error) {
    console.error('Error getting initial greeting:', error);
    
    // Fallback greeting if API call fails
    return "Hello, I'm your AI Therapy Assistant. I'm here to listen and support you. How are you feeling today?";
  }
}; 