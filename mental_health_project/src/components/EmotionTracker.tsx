import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label
} from 'recharts';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Define emotion types and their color representation
const EMOTIONS = {
  joy: { label: 'Joy', color: '#4ade80' },      // green
  sadness: { label: 'Sadness', color: '#60a5fa' }, // blue
  anger: { label: 'Anger', color: '#f87171' },   // red
  anxiety: { label: 'Anxiety', color: '#fbbf24' }, // amber
  fear: { label: 'Fear', color: '#c084fc' },    // purple
  surprise: { label: 'Surprise', color: '#22d3ee' }, // cyan
  trust: { label: 'Trust', color: '#2dd4bf' }    // teal
};

// Define the data structure for emotion entries
export interface EmotionEntry {
  timestamp: number;
  emotions: {
    [key: string]: number; // emotion name -> intensity (0-1)
  };
  note?: string;
}

interface EmotionTrackerProps {
  darkMode: boolean;
  onClose?: () => void;
  sessionData?: EmotionEntry[];
  currentUserProfile?: any;
}

const EmotionTracker: React.FC<EmotionTrackerProps> = ({
  darkMode,
  onClose,
  sessionData = [],
  currentUserProfile
}) => {
  // State for tracking emotion data
  const [emotionData, setEmotionData] = useState<EmotionEntry[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(Object.keys(EMOTIONS));
  
  // Load emotion data from localStorage on component mount
  useEffect(() => {
    const loadEmotionData = () => {
      try {
        // Try to load from props first
        if (sessionData && sessionData.length > 0) {
          setEmotionData(sessionData);
          return;
        }
        
        // Otherwise load from localStorage
        const savedData = localStorage.getItem('journal-emotion-data');
        if (savedData) {
          const parsedData = JSON.parse(savedData) as EmotionEntry[];
          setEmotionData(parsedData);
        }
      } catch (error) {
        console.error('Error loading emotion data:', error);
      }
    };
    
    loadEmotionData();
  }, [sessionData]);
  
  // Prepare chart data based on time range
  const getChartData = () => {
    if (!emotionData.length) return [];
    
    // Filter data based on selected time range
    const now = Date.now();
    const filteredData = emotionData.filter(entry => {
      if (timeRange === 'week') {
        return now - entry.timestamp < 7 * 24 * 60 * 60 * 1000; // 7 days
      } else if (timeRange === 'month') {
        return now - entry.timestamp < 30 * 24 * 60 * 60 * 1000; // 30 days
      }
      return true; // 'all' time range
    });
    
    // Sort data by timestamp
    const sortedData = [...filteredData].sort((a, b) => a.timestamp - b.timestamp);
    
    // Format data for the chart
    return sortedData.map(entry => {
      const formattedDate = new Date(entry.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return {
        date: formattedDate,
        timestamp: entry.timestamp,
        ...entry.emotions
      };
    });
  };
  
  // Toggle emotion visibility in chart
  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };
  
  const chartData = getChartData();
  
  // Calculate emotion averages
  const calculateAverages = () => {
    if (!emotionData.length) return {};
    
    const sums: {[key: string]: number} = {};
    const counts: {[key: string]: number} = {};
    
    emotionData.forEach(entry => {
      Object.entries(entry.emotions).forEach(([emotion, value]) => {
        if (value > 0) { // Only count non-zero values
          sums[emotion] = (sums[emotion] || 0) + value;
          counts[emotion] = (counts[emotion] || 0) + 1;
        }
      });
    });
    
    const averages: {[key: string]: number} = {};
    Object.keys(sums).forEach(emotion => {
      averages[emotion] = sums[emotion] / counts[emotion];
    });
    
    return averages;
  };
  
  const emotionAverages = calculateAverages();
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-md shadow-lg ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
          <p className="text-sm font-medium mb-1">{label}</p>
          <div className="space-y-1">
            {payload.map((item: any, index: number) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs">
                  {item.name in EMOTIONS 
                    ? EMOTIONS[item.name as keyof typeof EMOTIONS].label 
                    : item.name}: {(item.value * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className={`flex flex-col h-full ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <h2 className="text-lg font-semibold flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Emotion Tracker
        </h2>
        <div className="flex items-center space-x-2">
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${
                darkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-100'
              }`}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {emotionData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No emotion data available yet. Continue using the AI Therapy Assistant to track your emotional journey.
            </p>
          </div>
        ) : (
          <>
            {/* Time range selector */}
            <div className="flex justify-center mb-4">
              <div className={`inline-flex rounded-md shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                    timeRange === 'week'
                      ? darkMode
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-500 text-white'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-4 py-2 text-sm font-medium ${
                    timeRange === 'month'
                      ? darkMode
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-500 text-white'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeRange('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                    timeRange === 'all'
                      ? darkMode
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-500 text-white'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
            
            {/* Emotion toggles */}
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {Object.entries(EMOTIONS).map(([key, { label, color }]) => (
                <button
                  key={key}
                  onClick={() => toggleEmotion(key)}
                  className={`px-3 py-1 text-xs rounded-full flex items-center ${
                    selectedEmotions.includes(key)
                      ? 'text-white'
                      : darkMode
                        ? 'text-gray-300 bg-gray-700'
                        : 'text-gray-700 bg-gray-100'
                  }`}
                  style={{ 
                    backgroundColor: selectedEmotions.includes(key) ? color : undefined,
                    opacity: selectedEmotions.includes(key) ? 1 : 0.5
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {/* Chart */}
            <div className={`w-full ${chartData.length > 0 ? 'h-64 md:h-80' : 'h-20'} mb-6`}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="date" 
                      stroke={darkMode ? '#9ca3af' : '#6b7280'}
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis 
                      stroke={darkMode ? '#9ca3af' : '#6b7280'} 
                      domain={[0, 1]}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    >
                      <Label
                        value="Intensity"
                        position="insideLeft"
                        angle={-90}
                        style={{ textAnchor: 'middle', fill: darkMode ? '#9ca3af' : '#6b7280' }}
                      />
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {Object.entries(EMOTIONS).map(([key, { label, color }]) => (
                      selectedEmotions.includes(key) && (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          name={key}
                          stroke={color}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      )
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No data available for the selected time range
                  </p>
                </div>
              )}
            </div>
            
            {/* Emotion averages */}
            <div className={`rounded-lg p-4 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <h3 className="text-sm font-medium mb-3">Emotional Averages</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(EMOTIONS)
                  .filter(([key]) => emotionAverages[key] !== undefined)
                  .sort(([keyA, _], [keyB, __]) => (emotionAverages[keyB] || 0) - (emotionAverages[keyA] || 0))
                  .map(([key, { label, color }]) => (
                    <div 
                      key={key}
                      className={`p-3 rounded-lg ${
                        darkMode ? 'bg-gray-700' : 'bg-white'
                      } shadow-sm`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">{label}</span>
                        <span 
                          className="text-xs font-bold"
                          style={{ color }}
                        >
                          {emotionAverages[key] ? `${(emotionAverages[key] * 100).toFixed(0)}%` : '0%'}
                        </span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div 
                          className="h-1.5 rounded-full" 
                          style={{ 
                            width: `${(emotionAverages[key] || 0) * 100}%`,
                            backgroundColor: color
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmotionTracker; 