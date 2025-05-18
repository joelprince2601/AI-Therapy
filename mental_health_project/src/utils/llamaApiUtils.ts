/**
 * Utility functions for interacting with Meta's Llama 3.3 8B Instruct model via OpenRouter
 */

// API key for OpenRouter from environment variables
const LLAMA_API_KEY = import.meta.env.VITE_LLAMA_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface LlamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlamaResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a request to the Llama 3.3 8B Instruct model via OpenRouter
 * @param messages Array of messages in the conversation
 * @param systemPrompt Optional system prompt to guide the model's behavior
 * @returns Promise resolving to the model's response
 */
export const sendLlamaRequest = async (
  messages: LlamaMessage[],
  systemPrompt?: string
): Promise<string> => {
  try {
    // Check if API key is available
    if (!LLAMA_API_KEY) {
      throw new Error('API key not found. Please set the VITE_LLAMA_API_KEY environment variable.');
    }
    
    // Prepare the conversation history with an optional system message
    const conversationHistory: LlamaMessage[] = [];
    
    // Add system prompt if provided
    if (systemPrompt) {
      conversationHistory.push({
        role: 'system',
        content: systemPrompt
      });
    }
    
    // Add the rest of the conversation
    conversationHistory.push(...messages);
    
    const hostname = window.location.hostname;
    const referer = hostname === 'localhost' ? 
      'http://localhost:5173' : 
      `https://${hostname}`;
    
    // Make the API request
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLAMA_API_KEY}`,
        'HTTP-Referer': referer,
        'X-Title': 'AI Therapy Assistant'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct',
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`API request failed: ${response.status} - ${errorData}`);
    }
    
    const data: LlamaResponse = await response.json();
    
    // Extract the response text
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error('No response from the model');
    }
  } catch (error) {
    console.error('Error calling Llama API:', error);
    return 'I apologize, but I encountered an issue processing your request. Please try again.';
  }
};

/**
 * Create a system prompt for the therapy assistant
 * @returns System prompt string
 */
export const createTherapySystemPrompt = (): string => {
  return `You are an AI Therapy Assistant designed to provide supportive, empathetic responses.
Your goal is to help users explore their thoughts and feelings in a safe space.

Guidelines:
- Respond with empathy and without judgment
- Ask thoughtful follow-up questions to encourage reflection
- Provide evidence-based insights when appropriate
- Recognize emotional states and respond accordingly
- Suggest coping strategies and resources when helpful
- Never diagnose medical or psychological conditions
- Maintain a warm, supportive tone throughout the conversation
- If the user is in crisis, encourage them to seek professional help

Remember that your purpose is to support the user's emotional wellbeing through conversation,
not to replace professional mental health care.`;
}; 
