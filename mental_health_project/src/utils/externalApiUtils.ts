/**
 * External API Utilities for advanced NLP and diagnostic capabilities
 * This module handles communication with external services for enhanced analysis
 */

import { Message } from '../hooks/useConversation';

// Types for external API responses
export interface NLPAnalysisResponse {
  sentiment: {
    score: number;
    label: string;
  };
  entities: {
    name: string;
    type: string;
    salience: number;
  }[];
  topics: string[];
  emotions: {
    [key: string]: number;
  };
  language_metrics: {
    complexity: number;
    formality: number;
    coherence: number;
  };
}

// Define the response structure for diagnostic analysis
export interface DiagnosticAnalysisResponse {
  overallAssessment: string;
  moodAnalysis: Record<string, number>;
  identifiedConcerns: string[];
  copingMechanisms: string[];
  recommendations: {
    text: string;
    resources?: {
      title: string;
      url?: string;
      description?: string;
    }[];
  }[];
  followUpPlan?: string;
}

// Define the response structure for online resources
export interface OnlineResourceResponse {
  title: string;
  source: string;
  url?: string;
  summary: string;
  treatments?: string[];
  managementTechniques?: string[];
  resources?: {
    title: string;
    url: string;
    description?: string;
  }[];
}

/**
 * Perform advanced NLP analysis on user text using external API
 * @param text The text to analyze
 * @returns Promise resolving to NLP analysis results
 */
export const performExternalNLPAnalysis = async (text: string): Promise<NLPAnalysisResponse | null> => {
  try {
    // In a real implementation, this would call an external NLP API
    // For now, we'll simulate a response with realistic data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate simulated response based on text content
    const lowerText = text.toLowerCase();
    
    // Basic sentiment analysis
    let sentimentScore = 0;
    const positiveWords = ['good', 'great', 'happy', 'better', 'joy', 'love', 'hope'];
    const negativeWords = ['bad', 'sad', 'angry', 'anxious', 'worried', 'stress', 'depressed'];
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) sentimentScore += 0.2;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) sentimentScore -= 0.2;
    });
    
    // Clamp sentiment between -1 and 1
    sentimentScore = Math.max(-1, Math.min(1, sentimentScore));
    
    // Determine sentiment label
    let sentimentLabel = 'neutral';
    if (sentimentScore <= -0.6) sentimentLabel = 'very_negative';
    else if (sentimentScore <= -0.2) sentimentLabel = 'negative';
    else if (sentimentScore >= 0.6) sentimentLabel = 'very_positive';
    else if (sentimentScore >= 0.2) sentimentLabel = 'positive';
    
    // Extract potential topics
    const topics: string[] = [];
    const topicKeywords: {[key: string]: string[]} = {
      'work': ['work', 'job', 'career', 'boss', 'office'],
      'relationships': ['relationship', 'partner', 'marriage', 'dating'],
      'family': ['family', 'parent', 'child', 'mother', 'father'],
      'health': ['health', 'illness', 'disease', 'doctor', 'pain'],
      'mental health': ['anxiety', 'depression', 'therapy', 'mental'],
      'finance': ['money', 'finance', 'debt', 'budget', 'saving'],
      'education': ['school', 'college', 'university', 'study', 'learn']
    };
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    // Emotion analysis
    const emotions: {[key: string]: number} = {
      'anxiety': 0,
      'sadness': 0,
      'anger': 0,
      'fear': 0,
      'joy': 0,
      'surprise': 0
    };
    
    const emotionKeywords: {[key: string]: string[]} = {
      'anxiety': ['anxious', 'nervous', 'worry', 'stress', 'overwhelm'],
      'sadness': ['sad', 'depressed', 'unhappy', 'miserable', 'down'],
      'anger': ['angry', 'mad', 'furious', 'irritated', 'annoyed'],
      'fear': ['scared', 'afraid', 'terrified', 'frightened', 'fearful'],
      'joy': ['happy', 'joyful', 'excited', 'delighted', 'pleased'],
      'surprise': ['surprised', 'shocked', 'amazed', 'astonished', 'stunned']
    };
    
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      keywords.forEach(word => {
        if (lowerText.includes(word)) {
          emotions[emotion] += 0.3;
        }
      });
      // Cap at 1.0
      emotions[emotion] = Math.min(emotions[emotion], 1);
    });
    
    return {
      sentiment: {
        score: sentimentScore,
        label: sentimentLabel
      },
      entities: extractEntities(text),
      topics,
      emotions,
      language_metrics: {
        complexity: calculateComplexity(text),
        formality: calculateFormality(text),
        coherence: 0.7 // Default value
      }
    };
  } catch (error) {
    console.error('Error performing external NLP analysis:', error);
    return null;
  }
};

/**
 * Generates a diagnostic assessment based on conversation history
 * In a real implementation, this would call an external API
 */
export async function generateDiagnosticAssessment(
  conversations: Message[]
): Promise<DiagnosticAnalysisResponse> {
  // This is a mock implementation - in a real app, this would call an external API
  console.log('Generating diagnostic assessment based on conversations:', conversations);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data
  return {
    overallAssessment: "Based on our conversations, you appear to be experiencing mild to moderate anxiety with some symptoms of stress. You've shown good self-awareness and have already implemented some helpful coping strategies.",
    
    moodAnalysis: {
      anxiety: 0.65,
      depression: 0.35,
      stress: 0.70,
      wellbeing: 0.45,
      hopefulness: 0.50
    },
    
    identifiedConcerns: [
      "Work-related stress affecting sleep quality",
      "Difficulty balancing personal and professional responsibilities",
      "Occasional feelings of being overwhelmed by social obligations",
      "Perfectionist tendencies leading to self-criticism"
    ],
    
    copingMechanisms: [
      "Regular exercise routine",
      "Journaling thoughts and feelings",
      "Seeking social support from friends",
      "Taking breaks when feeling overwhelmed"
    ],
    
    recommendations: [
      {
        text: "Consider incorporating mindfulness meditation into your daily routine to help manage anxiety symptoms.",
        resources: [
          {
            title: "Headspace App",
            url: "https://www.headspace.com",
            description: "Guided meditation and mindfulness exercises"
          },
          {
            title: "Mindful.org",
            url: "https://www.mindful.org",
            description: "Free mindfulness resources and practices"
          }
        ]
      },
      {
        text: "Establish clearer boundaries between work and personal time to reduce stress levels.",
        resources: [
          {
            title: "Digital Wellbeing Tools",
            description: "Use your device's built-in tools to set app timers and downtime"
          }
        ]
      },
      {
        text: "Practice self-compassion techniques to address perfectionist tendencies.",
        resources: [
          {
            title: "Self-Compassion.org",
            url: "https://self-compassion.org",
            description: "Exercises and resources by Dr. Kristin Neff"
          }
        ]
      }
    ],
    
    followUpPlan: "Continue practicing the recommended techniques for the next two weeks. Notice any changes in your anxiety levels and sleep quality. Consider scheduling a follow-up session to discuss progress and adjust strategies as needed."
  };
}

/**
 * Searches for mental health information based on a query
 * In a real implementation, this would call an external API
 */
export async function searchMentalHealthInformation(
  query: string
): Promise<OnlineResourceResponse> {
  // This is a mock implementation - in a real app, this would call an external API
  console.log('Searching for mental health information:', query);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Normalize query for mock response selection
  const normalizedQuery = query.toLowerCase();
  
  // Return different mock responses based on the query
  if (normalizedQuery.includes('anxiety')) {
    return {
      title: "Generalized Anxiety Disorder (GAD)",
      source: "National Institute of Mental Health",
      url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
      summary: "Generalized Anxiety Disorder (GAD) is characterized by persistent and excessive worry about a variety of different things. People with GAD may anticipate disaster and may be overly concerned about money, health, family, work, or other issues. Individuals with GAD find it difficult to control their worry.",
      treatments: [
        "Cognitive Behavioral Therapy (CBT)",
        "Medication (SSRIs, SNRIs)",
        "Relaxation techniques",
        "Mindfulness practices"
      ],
      managementTechniques: [
        "Regular physical activity",
        "Stress management and relaxation techniques",
        "Avoiding caffeine, alcohol, and nicotine",
        "Getting adequate sleep",
        "Maintaining a healthy diet"
      ],
      resources: [
        {
          title: "Anxiety and Depression Association of America",
          url: "https://adaa.org",
          description: "Resources and support for anxiety disorders"
        },
        {
          title: "NIMH Anxiety Disorders",
          url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
          description: "Information from the National Institute of Mental Health"
        }
      ]
    };
  } else if (normalizedQuery.includes('depression')) {
    return {
      title: "Major Depressive Disorder",
      source: "American Psychiatric Association",
      url: "https://www.psychiatry.org/patients-families/depression",
      summary: "Depression (major depressive disorder) is a common and serious medical illness that negatively affects how you feel, the way you think and how you act. Depression causes feelings of sadness and/or a loss of interest in activities you once enjoyed. It can lead to a variety of emotional and physical problems and can decrease your ability to function at work and at home.",
      treatments: [
        "Psychotherapy",
        "Medication (antidepressants)",
        "Electroconvulsive Therapy (ECT) for severe cases",
        "Transcranial Magnetic Stimulation (TMS)"
      ],
      managementTechniques: [
        "Regular exercise",
        "Maintaining social connections",
        "Setting realistic goals",
        "Practicing mindfulness",
        "Establishing routine sleep patterns"
      ],
      resources: [
        {
          title: "National Alliance on Mental Illness (NAMI)",
          url: "https://www.nami.org/About-Mental-Illness/Mental-Health-Conditions/Depression",
          description: "Information and support resources for depression"
        },
        {
          title: "Depression and Bipolar Support Alliance",
          url: "https://www.dbsalliance.org",
          description: "Support groups and resources"
        }
      ]
    };
  } else if (normalizedQuery.includes('stress') || normalizedQuery.includes('burnout')) {
    return {
      title: "Stress Management and Burnout Prevention",
      source: "American Psychological Association",
      url: "https://www.apa.org/topics/stress",
      summary: "Stress is a normal psychological and physical reaction to the demands of life. A small amount of stress can be good, motivating you to perform well. But multiple challenges daily, such as sitting in traffic, meeting deadlines and paying bills, can push you beyond your ability to cope. Chronic stress can lead to burnout, a state of emotional, physical, and mental exhaustion caused by excessive and prolonged stress.",
      managementTechniques: [
        "Time management strategies",
        "Setting boundaries",
        "Regular physical activity",
        "Relaxation techniques like deep breathing",
        "Seeking social support",
        "Practicing self-care"
      ],
      resources: [
        {
          title: "APA's Stress Management Resources",
          url: "https://www.apa.org/topics/stress/managing-stress",
          description: "Tips and strategies for managing stress"
        },
        {
          title: "Mayo Clinic Stress Management",
          url: "https://www.mayoclinic.org/healthy-lifestyle/stress-management/basics/stress-basics/hlv-20049495",
          description: "Comprehensive guide to understanding and managing stress"
        }
      ]
    };
  } else {
    // Default response for other queries
    return {
      title: "Mental Health Resources",
      source: "Mental Health America",
      url: "https://www.mhanational.org",
      summary: "Mental health includes our emotional, psychological, and social well-being. It affects how we think, feel, and act. It also helps determine how we handle stress, relate to others, and make choices. Mental health is important at every stage of life, from childhood and adolescence through adulthood.",
      resources: [
        {
          title: "Mental Health America",
          url: "https://www.mhanational.org",
          description: "Resources and screening tools for various mental health conditions"
        },
        {
          title: "National Alliance on Mental Illness",
          url: "https://www.nami.org",
          description: "Support groups, education programs, and advocacy"
        },
        {
          title: "Psychology Today Therapist Finder",
          url: "https://www.psychologytoday.com/us/therapists",
          description: "Directory to find therapists in your area"
        }
      ]
    };
  }
}

// Helper functions for text analysis

const extractEntities = (text: string): any[] => {
  const entities = [];
  
  // Extract proper nouns (simplified approach)
  const properNouns = text.match(/\b[A-Z][a-z]+\b/g) || [];
  properNouns.forEach(noun => {
    if (noun.length > 1) {
      entities.push({
        name: noun,
        type: 'PERSON', // Simplified assumption
        salience: 0.5
      });
    }
  });
  
  return entities;
};

const calculateComplexity = (text: string): number => {
  // Simple complexity calculation based on average word length and sentence length
  const words = text.split(/\s+/);
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = words.length / (sentences.length || 1);
  
  // Normalize to 0-1 range
  return Math.min(((avgWordLength - 3) / 3) * 0.5 + ((avgSentenceLength - 5) / 15) * 0.5, 1);
};

const calculateFormality = (text: string): number => {
  // Simple formality calculation based on presence of formal vs. informal language
  const lowerText = text.toLowerCase();
  
  const formalIndicators = [
    'therefore', 'however', 'furthermore', 'nevertheless', 'regarding',
    'additionally', 'consequently', 'thus', 'hence', 'moreover'
  ];
  
  const informalIndicators = [
    'yeah', 'nah', 'kinda', 'sorta', 'gonna', 'wanna', 'gotta',
    'like', 'just', 'stuff', 'things', 'okay', 'ok', 'cool'
  ];
  
  let formalCount = 0;
  let informalCount = 0;
  
  formalIndicators.forEach(word => {
    if (lowerText.includes(word)) formalCount++;
  });
  
  informalIndicators.forEach(word => {
    if (lowerText.includes(word)) informalCount++;
  });
  
  // Calculate formality score (0-1)
  if (formalCount === 0 && informalCount === 0) return 0.5;
  return formalCount / (formalCount + informalCount);
}; 