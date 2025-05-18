import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Bot, User, RefreshCw } from 'lucide-react';
import { sendLlamaRequest, LlamaMessage, createTherapySystemPrompt } from '../utils/llamaApiUtils';

interface LlamaChatProps {
  darkMode: boolean;
  onClose?: () => void;
}

const LlamaChat: React.FC<LlamaChatProps> = ({ 
  darkMode,
  onClose
}) => {
  const [messages, setMessages] = useState<LlamaMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    // Clear any previous errors
    setError(null);

    // Add user message
    const userMessage: LlamaMessage = {
      role: 'user',
      content: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get system prompt
      const systemPrompt = createTherapySystemPrompt();
      
      // Send request to Llama API
      const response = await sendLlamaRequest([...messages, userMessage], systemPrompt);
      
      // Add assistant response
      const assistantMessage: LlamaMessage = {
        role: 'assistant',
        content: response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message to Llama:', error);
      
      // Store error message
      setError('Failed to get response from the AI model. Please try again.');
      
      // Add error message
      const errorMessage: LlamaMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an issue processing your request. Please try again.'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className={`flex flex-col h-full rounded-lg overflow-hidden ${
      darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
    }`}>
      {/* Header */}
      <div className={`flex justify-between items-center p-3 ${
        darkMode ? 'bg-gray-700' : 'bg-indigo-100'
      }`}>
        <div className="flex items-center">
          <Bot className={`h-5 w-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          <h3 className="font-medium">Llama 3.3 8B Assistant</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={clearConversation}
            className={`p-1 rounded-full ${
              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
            }`}
            title="Clear conversation"
          >
            <Trash2 size={18} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1 rounded-full ${
                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
              }`}
              title="Close Llama chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className={`px-4 py-2 text-sm ${
          darkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'
        }`}>
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 ${
        darkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className={`h-12 w-12 mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Llama 3.3 8B Instruct
            </h3>
            <p className={`max-w-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              This is a direct integration with Meta's Llama 3.3 8B Instruct model via OpenRouter. Start a conversation to see how it responds.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? darkMode ? 'bg-indigo-600' : 'bg-indigo-100'
                      : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  } mr-2 ml-2`}>
                    {message.role === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? darkMode ? 'bg-indigo-600' : 'bg-indigo-100'
                      : darkMode ? 'bg-gray-700' : 'bg-white'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%]">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  } mr-2`}>
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className={`p-3 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-white'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Generating response...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`p-3 border-t ${
        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className={`w-full p-3 pr-10 rounded-lg resize-none ${
                darkMode
                  ? 'bg-gray-600 text-white placeholder-gray-400 border-gray-600'
                  : 'bg-gray-50 text-gray-900 placeholder-gray-500 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === '' || isLoading}
            className={`p-3 rounded-lg ${
              inputValue.trim() === '' || isLoading
                ? darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-400'
                : darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LlamaChat; 