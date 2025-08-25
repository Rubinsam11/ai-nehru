// Simple AI response generator (in a real app, this would connect to an AI API)
export function generateAIResponse(userMessage: string): string {
  const responses = [
    "That's an interesting question! Let me think about that for you.",
    "I understand what you're asking. Here's my perspective on that topic.",
    "Great point! I'd be happy to help you with that.",
    "That's a thoughtful question. Based on what you've shared, I think...",
    "I appreciate you asking that. Let me provide you with some insights.",
    "Excellent question! Here's what I can tell you about that.",
    "I'm glad you brought that up. From my understanding...",
    "That's something I can definitely help you with. Here's my take:",
  ];

  // Simple keyword-based responses
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! It's great to meet you. How can I assist you today?";
  }
  
  if (lowerMessage.includes('how are you')) {
    return "I'm doing well, thank you for asking! I'm here and ready to help you with whatever you need.";
  }
  
  if (lowerMessage.includes('weather')) {
    return "I don't have access to real-time weather data, but I'd recommend checking a weather app or website for the most current conditions in your area.";
  }
  
  if (lowerMessage.includes('time')) {
    return `The current time is ${new Date().toLocaleTimeString()}. Is there anything specific you'd like to know about time or scheduling?`;
  }

  if (lowerMessage.includes('help')) {
    return "I'm here to help! You can ask me questions, have a conversation, or just chat. I can respond both in text and voice. What would you like to know?";
  }

  // Return a random response for other messages
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  return `${randomResponse} You mentioned: "${userMessage}". That's quite interesting to discuss!`;
}