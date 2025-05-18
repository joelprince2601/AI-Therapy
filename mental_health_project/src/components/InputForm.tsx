import React, { useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Search } from 'lucide-react';
import VoiceWaveAnimation from './VoiceWaveAnimation';

interface InputFormProps {
  entry: string;
  setEntry: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isTyping: boolean;
  isListening: boolean;
  isProcessingVoice: boolean;
  toggleListening: () => void;
  darkMode: boolean;
  onSearchClick: () => void;
}

const InputForm: React.FC<InputFormProps> = ({
  entry,
  setEntry,
  handleSubmit,
  isTyping,
  isListening,
  isProcessingVoice,
  toggleListening,
  darkMode,
  onSearchClick
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(200, textareaRef.current.scrollHeight)}px`;
    }
  }, [entry]);

  // Scroll to bottom of textarea when entry changes during listening
  useEffect(() => {
    if (isListening && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [entry, isListening]);

  return (
    <div className={`border-t p-4 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-2">
        <div className="text-xs text-center mb-1">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
            Share your thoughts and feelings. Your conversation is private.
          </span>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <div className="flex items-center">
              <label htmlFor="journal-entry" className="sr-only">Your message</label>
              {isListening && (
                <div className="absolute top-2 left-3 z-10 flex items-center">
                  <span className={`text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-600'} font-medium`}>
                    {isProcessingVoice ? "Processing..." : "Listening..."}
                  </span>
                  <VoiceWaveAnimation 
                    isActive={isListening} 
                    type={isProcessingVoice ? "processing" : "listening"}
                    darkMode={darkMode} 
                  />
                  <span className="ml-2 text-xs text-gray-400">(minimum 10s)</span>
                </div>
              )}
            </div>
            <textarea
              ref={textareaRef}
              id="journal-entry"
              rows={3}
              placeholder={isListening ? "Listening... Speak your thoughts" : "How are you feeling today? What's on your mind?"}
              className={`w-full p-3 ${isListening ? 'pt-10' : ''} rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } border`}
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              style={{ minHeight: '100px' }}
            />
            <div className="absolute right-3 top-3 flex gap-2">
              <button
                type="button"
                onClick={onSearchClick}
                className={`p-2 rounded-full ${
                  darkMode
                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="Search for information"
                aria-label="Search for information"
                disabled={isTyping}
              >
                <Search size={18} />
              </button>
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-indigo-500 hover:bg-indigo-600'
                }`}
                aria-label={isListening ? "Stop listening" : "Start listening"}
                title={isListening ? "Stop listening" : "Start voice input (min 10s)"}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 text-white" />
                ) : (
                  <Mic className="h-4 w-4 text-white" />
                )}
              </button>
              {isListening && (
                <div className="text-xs text-gray-400 flex items-center">
                  Click to stop
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={!entry.trim() || isTyping}
            className={`p-3 rounded-lg ${
              !entry.trim() || isTyping
                ? 'bg-gray-300 cursor-not-allowed dark:bg-gray-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            } transition-colors`}
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm; 