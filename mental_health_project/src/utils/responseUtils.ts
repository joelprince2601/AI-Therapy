/**
 * Generates a supportive response based on the user's input
 * @param userEntry The user's journal entry text
 * @returns A supportive response message
 */
export const generateResponse = (userEntry: string): string => {
  const lowerEntry = userEntry.toLowerCase();
  
  if (lowerEntry.includes('suicide') || lowerEntry.includes('kill myself') || lowerEntry.includes('want to die')) {
    return "I hear you're in a lot of pain right now, and I'm very concerned. Please know you're not alone. Can you call or text 988 right now to speak with someone who can help? They're available 24/7 and really care about supporting you through this.";
  }
  
  if (lowerEntry.includes('sad') || lowerEntry.includes('depressed') || lowerEntry.includes('unhappy')) {
    return "I hear how heavy things feel right now. You're not alone in this. What's one tiny thing that brought you even a moment of peace today?";
  }
  
  if (lowerEntry.includes('anxious') || lowerEntry.includes('worried') || lowerEntry.includes('stress')) {
    return "I can hear the anxiety in your voice. Let's take a slow breath together. What's one small thing you can see or touch right now that helps you feel grounded?";
  }
  
  if (lowerEntry.includes('angry') || lowerEntry.includes('frustrated') || lowerEntry.includes('mad')) {
    return "I hear how frustrated you're feeling. Your feelings are valid. What do you think your anger might be trying to tell you?";
  }
  
  const supportiveResponses = [
    "Thank you for sharing that with me. What feelings come up as you say this out loud?",
    "I'm here with you, listening. What would feel like a small step forward right now?",
    "I hear you. You're showing courage by opening up. What do you need most in this moment?",
    "Your feelings matter. What would you say to a friend feeling this way?"
  ];
  
  return supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];
}; 