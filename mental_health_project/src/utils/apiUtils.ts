/**
 * API Utilities for external service integration
 * Using free public APIs to enhance the AI Therapy Assistant
 */

// Types for API responses
export interface QuoteResponse {
  content: string;
  author: string;
  tags: string[];
}

export interface AdviceResponse {
  slip: {
    id: number;
    advice: string;
  };
}

export interface MeditationExercise {
  name: string;
  description: string;
  duration: string;
  category: string;
}

export interface CopingStrategy {
  strategy: string;
  description: string;
  category: string;
}

export interface MentalHealthResource {
  name: string;
  description: string;
  url?: string;
  phone?: string;
  category: string;
}

/**
 * Fetch an inspirational quote from the Quotable API
 * @returns A promise resolving to a quote object
 */
export const fetchInspirationalQuote = async (
  tags: string[] = ['inspirational', 'wisdom']
): Promise<QuoteResponse | null> => {
  try {
    const tagsParam = tags.join(',');
    const response = await fetch(`https://api.quotable.io/random?tags=${tagsParam}`);
    
    if (!response.ok) {
      console.error('Quote API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    return {
      content: data.content,
      author: data.author,
      tags: data.tags
    };
  } catch (error) {
    console.error('Error fetching quote:', error);
    return null;
  }
};

/**
 * Fetch random advice from the Advice Slip API
 * @returns A promise resolving to an advice object
 */
export const fetchRandomAdvice = async (): Promise<AdviceResponse | null> => {
  try {
    // Using a timestamp to avoid caching issues with this API
    const timestamp = new Date().getTime();
    const response = await fetch(`https://api.adviceslip.com/advice?t=${timestamp}`);
    
    if (!response.ok) {
      console.error('Advice API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching advice:', error);
    return null;
  }
};

/**
 * Get a breathing exercise based on the user's emotional state
 * @param emotion The primary emotion detected in the user
 * @returns A breathing exercise instruction
 */
export const getBreathingExercise = (emotion: string): string => {
  const exercises = {
    anxiety: "Try this 4-7-8 breathing technique: Inhale quietly through your nose for 4 seconds, hold your breath for 7 seconds, then exhale completely through your mouth for 8 seconds. Repeat 4 times.",
    stress: "Practice box breathing: Inhale for 4 counts, hold for 4 counts, exhale for 4 counts, hold for 4 counts. Visualize tracing a square as you breathe. Continue for 2 minutes.",
    anger: "Try this cooling breath: Inhale deeply through your nose, then exhale slowly through your mouth as if you're blowing through a straw. Feel the heat leaving your body with each exhale. Repeat 6 times.",
    sadness: "Practice this grounding breath: Place one hand on your chest and one on your belly. Breathe deeply into your belly for 5 seconds, hold briefly, then exhale for 6 seconds. Continue for 3 minutes.",
    default: "Take a moment for a simple breathing exercise: Breathe in slowly through your nose for 5 seconds, then out through your mouth for 5 seconds. Notice how your body feels as you breathe. Continue for 1 minute."
  };
  
  const lowerEmotion = emotion.toLowerCase();
  
  if (lowerEmotion.includes('anx')) return exercises.anxiety;
  if (lowerEmotion.includes('stress')) return exercises.stress;
  if (lowerEmotion.includes('anger') || lowerEmotion.includes('frustrat')) return exercises.anger;
  if (lowerEmotion.includes('sad') || lowerEmotion.includes('depress')) return exercises.sadness;
  
  return exercises.default;
};

/**
 * Get a mindfulness exercise based on user's needs
 * @param category The category of mindfulness exercise needed
 * @returns A mindfulness exercise instruction
 */
export const getMindfulnessExercise = (category: string = 'general'): MeditationExercise => {
  const exercises: Record<string, MeditationExercise[]> = {
    grounding: [
      {
        name: "5-4-3-2-1 Technique",
        description: "Notice 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This helps bring you back to the present moment.",
        duration: "3-5 minutes",
        category: "grounding"
      },
      {
        name: "Body Scan",
        description: "Starting from your toes and moving up to your head, pay attention to each part of your body, noticing any sensations without judgment.",
        duration: "5-10 minutes",
        category: "grounding"
      }
    ],
    anxiety: [
      {
        name: "Mindful Breathing",
        description: "Focus your attention on your breath. Notice the sensation of air flowing in and out of your body. When your mind wanders, gently bring it back to your breath.",
        duration: "5-10 minutes",
        category: "anxiety"
      },
      {
        name: "Worry Time",
        description: "Set aside 10 minutes to write down all your worries. When the time is up, put the list away and remind yourself that you've given your worries attention and can now focus on other things.",
        duration: "10 minutes",
        category: "anxiety"
      }
    ],
    depression: [
      {
        name: "Gratitude Practice",
        description: "Write down or mentally note three things you're grateful for today, no matter how small. Try to find new things each day.",
        duration: "5 minutes",
        category: "depression"
      },
      {
        name: "Pleasant Activity Scheduling",
        description: "Choose one small activity that usually brings you joy and commit to doing it today, even if you don't feel motivated. Notice any positive feelings that arise.",
        duration: "varies",
        category: "depression"
      }
    ],
    sleep: [
      {
        name: "Progressive Muscle Relaxation",
        description: "Tense and then release each muscle group in your body, starting from your toes and working up to your head. Hold each tension for 5 seconds, then release and notice the relaxation.",
        duration: "10-15 minutes",
        category: "sleep"
      },
      {
        name: "Bedtime Body Scan",
        description: "Lying in bed, bring awareness to each part of your body from toes to head, consciously relaxing each area as you go.",
        duration: "10 minutes",
        category: "sleep"
      }
    ],
    general: [
      {
        name: "Mindful Observation",
        description: "Choose an object in your environment and focus all your attention on it for two minutes. Notice its colors, textures, shapes, and other qualities without judgment.",
        duration: "2-3 minutes",
        category: "general"
      },
      {
        name: "Three Mindful Breaths",
        description: "Pause what you're doing and take three slow, deep breaths. Focus completely on the sensation of breathing, letting go of thoughts with each exhale.",
        duration: "1 minute",
        category: "general"
      }
    ]
  };
  
  const lowerCategory = category.toLowerCase();
  let categoryKey = 'general';
  
  if (lowerCategory.includes('ground')) categoryKey = 'grounding';
  else if (lowerCategory.includes('anx')) categoryKey = 'anxiety';
  else if (lowerCategory.includes('depress') || lowerCategory.includes('sad')) categoryKey = 'depression';
  else if (lowerCategory.includes('sleep')) categoryKey = 'sleep';
  
  const categoryExercises = exercises[categoryKey] || exercises.general;
  return categoryExercises[Math.floor(Math.random() * categoryExercises.length)];
};

/**
 * Get coping strategies based on user's emotional needs
 * @param emotion The primary emotion to address
 * @returns A coping strategy
 */
export const getCopingStrategy = (emotion: string): CopingStrategy => {
  const strategies: Record<string, CopingStrategy[]> = {
    anxiety: [
      {
        strategy: "Grounding Technique",
        description: "Find 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
        category: "anxiety"
      },
      {
        strategy: "Worry Box",
        description: "Write down your worries on paper, put them in a box, and set a specific time to review them later. This helps contain anxiety to a specific time.",
        category: "anxiety"
      }
    ],
    depression: [
      {
        strategy: "Behavioral Activation",
        description: "Choose one small activity that you used to enjoy and do it today, even if you don't feel motivated. Notice how your mood shifts afterward.",
        category: "depression"
      },
      {
        strategy: "Achievement Journal",
        description: "Each evening, write down three things you accomplished today, no matter how small. This helps counter negative thoughts about self-worth.",
        category: "depression"
      }
    ],
    anger: [
      {
        strategy: "Time-Out",
        description: "When you feel anger rising, give yourself permission to take a 10-minute break before responding. Use this time to cool down and gather your thoughts.",
        category: "anger"
      },
      {
        strategy: "Physical Release",
        description: "Channel anger energy into a physical activity like brisk walking, running, or even tearing up paper. Physical movement helps process the emotion.",
        category: "anger"
      }
    ],
    grief: [
      {
        strategy: "Memory Box",
        description: "Create a special box or digital folder for mementos that remind you of what you've lost. Visit it when you want to connect with those memories.",
        category: "grief"
      },
      {
        strategy: "Grief Journaling",
        description: "Write a letter to the person, opportunity, or thing you've lost. Express your feelings openly without judgment.",
        category: "grief"
      }
    ],
    general: [
      {
        strategy: "Self-Compassion Break",
        description: "When struggling, place your hand on your heart and say: 'This is a moment of suffering. Suffering is part of life. May I be kind to myself in this moment.'",
        category: "general"
      },
      {
        strategy: "Values Reflection",
        description: "Take a moment to reflect on what matters most to you. Choose one small action aligned with your values that you can take today.",
        category: "general"
      }
    ]
  };
  
  const lowerEmotion = emotion.toLowerCase();
  let emotionKey = 'general';
  
  if (lowerEmotion.includes('anx')) emotionKey = 'anxiety';
  else if (lowerEmotion.includes('depress') || lowerEmotion.includes('sad')) emotionKey = 'depression';
  else if (lowerEmotion.includes('anger') || lowerEmotion.includes('mad') || lowerEmotion.includes('frustrat')) emotionKey = 'anger';
  else if (lowerEmotion.includes('grief') || lowerEmotion.includes('loss')) emotionKey = 'grief';
  
  const emotionStrategies = strategies[emotionKey] || strategies.general;
  return emotionStrategies[Math.floor(Math.random() * emotionStrategies.length)];
};

/**
 * Get mental health resources based on user needs
 * @param category The category of resources needed
 * @returns A mental health resource
 */
export const getMentalHealthResource = (category: string = 'general'): MentalHealthResource => {
  const resources: Record<string, MentalHealthResource[]> = {
    crisis: [
      {
        name: "National Suicide Prevention Lifeline",
        description: "24/7, free and confidential support for people in distress, prevention and crisis resources.",
        phone: "988 or 1-800-273-8255",
        url: "https://suicidepreventionlifeline.org",
        category: "crisis"
      },
      {
        name: "Crisis Text Line",
        description: "Free 24/7 support for those in crisis. Text with a trained crisis counselor.",
        phone: "Text HOME to 741741",
        url: "https://www.crisistextline.org",
        category: "crisis"
      }
    ],
    anxiety: [
      {
        name: "Anxiety and Depression Association of America",
        description: "Information, resources, and support for anxiety disorders.",
        url: "https://adaa.org",
        category: "anxiety"
      },
      {
        name: "MindShift App",
        description: "Free app with strategies to deal with anxiety, including tools for relaxation and developing more helpful ways of thinking.",
        url: "https://www.anxietycanada.com/resources/mindshift-cbt",
        category: "anxiety"
      }
    ],
    depression: [
      {
        name: "Depression and Bipolar Support Alliance",
        description: "Support groups, education, and tools for depression and bipolar disorder.",
        url: "https://www.dbsalliance.org",
        category: "depression"
      },
      {
        name: "7 Cups",
        description: "Free emotional support through online chat with trained listeners.",
        url: "https://www.7cups.com",
        category: "depression"
      }
    ],
    general: [
      {
        name: "Mental Health America",
        description: "Tools, screening, information, and resources for various mental health concerns.",
        url: "https://www.mhanational.org",
        category: "general"
      },
      {
        name: "NAMI (National Alliance on Mental Illness)",
        description: "Education, support groups, and resources for individuals and families affected by mental illness.",
        url: "https://www.nami.org",
        category: "general"
      }
    ]
  };
  
  const lowerCategory = category.toLowerCase();
  let categoryKey = 'general';
  
  if (lowerCategory.includes('crisis') || lowerCategory.includes('suicid')) categoryKey = 'crisis';
  else if (lowerCategory.includes('anx')) categoryKey = 'anxiety';
  else if (lowerCategory.includes('depress')) categoryKey = 'depression';
  
  const categoryResources = resources[categoryKey] || resources.general;
  return categoryResources[Math.floor(Math.random() * categoryResources.length)];
};

/**
 * Check if a string contains crisis indicators
 * @param text The text to check for crisis indicators
 * @returns Boolean indicating if crisis indicators are present
 */
export const containsCrisisIndicators = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die',
    'harm myself', 'hurt myself', 'self-harm',
    'no reason to live', 'better off dead'
  ];
  
  return crisisKeywords.some(keyword => lowerText.includes(keyword));
};

/**
 * Enhance a therapeutic response with external data when appropriate
 * @param baseResponse The original therapeutic response
 * @param userProfile User profile or emotion string
 * @param topicOrCrisis Topic string or crisis boolean
 * @returns A promise resolving to an enhanced response
 */
export const enhanceResponseWithExternalData = async (
  baseResponse: string,
  userProfile: any,
  topicOrCrisis: any
): Promise<string> => {
  // Extract emotion from parameters - handle different parameter types
  let emotion = 'neutral';
  let isCrisis = false;
  
  if (typeof userProfile === 'string') {
    // Old API format - direct emotion string
    emotion = userProfile;
  } else if (userProfile && userProfile.dominantEmotions && userProfile.dominantEmotions.length > 0) {
    // Session state format
    emotion = userProfile.dominantEmotions[0];
    isCrisis = userProfile.crisisDetected || false;
  } else if (userProfile && userProfile.personalityTraits) {
    // User profile format
    // Try to extract emotion from concerns
    const concerns = Object.keys(userProfile.concerns || {});
    if (concerns.length > 0) {
      if (concerns.includes('anxiety')) emotion = 'anxiety';
      else if (concerns.includes('sadness')) emotion = 'depression';
      else if (concerns.includes('anger')) emotion = 'anger';
    }
  }
  
  // Handle crisis parameter
  if (typeof topicOrCrisis === 'boolean') {
    isCrisis = topicOrCrisis;
  } else if (topicOrCrisis === 'crisis') {
    isCrisis = true;
  }
  
  // For crisis situations, always provide resources without additional content
  if (isCrisis) {
    const resource = getMentalHealthResource('crisis');
    return `${baseResponse}\n\nResource: ${resource.name} - ${resource.description} ${resource.phone ? `Contact: ${resource.phone}` : ''} ${resource.url ? `Website: ${resource.url}` : ''}`;
  }
  
  // Randomly select which type of enhancement to add
  const enhancementType = Math.floor(Math.random() * 5);
  
  try {
    switch (enhancementType) {
      case 0: {
        // Add an inspirational quote
        const quote = await fetchInspirationalQuote();
        if (quote) {
          return `${baseResponse}\n\n"${quote.content}" - ${quote.author}`;
        }
        break;
      }
      case 1: {
        // Add a breathing exercise
        const exercise = getBreathingExercise(emotion);
        return `${baseResponse}\n\nBreathing Exercise: ${exercise}`;
      }
      case 2: {
        // Add a mindfulness exercise
        const mindfulness = getMindfulnessExercise(emotion);
        return `${baseResponse}\n\nMindfulness Practice - ${mindfulness.name}: ${mindfulness.description} (${mindfulness.duration})`;
      }
      case 3: {
        // Add a coping strategy
        const strategy = getCopingStrategy(emotion);
        return `${baseResponse}\n\nCoping Strategy - ${strategy.strategy}: ${strategy.description}`;
      }
      case 4: {
        // Add a mental health resource
        const resource = getMentalHealthResource(emotion);
        return `${baseResponse}\n\nResource: ${resource.name} - ${resource.description} ${resource.url ? `\nWebsite: ${resource.url}` : ''}`;
      }
    }
  } catch (error) {
    console.error('Error enhancing response:', error);
    // In case of error, return the original response
    return baseResponse;
  }
  
  // Default return if API calls fail
  return baseResponse;
}; 