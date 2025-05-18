import React from 'react';
import { X, AlertCircle, Info, Download } from 'lucide-react';
import { DiagnosticAnalysisResponse } from '../utils/externalApiUtils';

interface DiagnosticSummaryProps {
  diagnosticData: DiagnosticAnalysisResponse;
  darkMode: boolean;
  onClose: () => void;
}

const DiagnosticSummary: React.FC<DiagnosticSummaryProps> = ({
  diagnosticData,
  darkMode,
  onClose
}) => {
  const handleDownloadPDF = () => {
    // This would be implemented with a PDF generation library
    console.log('Download PDF functionality would be implemented here');
    alert('This feature would generate a PDF report of this assessment.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
          darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
        }`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 flex justify-between items-center p-4 border-b ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className="text-xl font-bold">Session Assessment Summary</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className={`p-2 rounded-full ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Download as PDF"
              aria-label="Download as PDF"
            >
              <Download size={20} />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Close"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Disclaimer */}
          <div className={`mb-6 p-4 rounded-lg border ${
            darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start">
              <AlertCircle className={`mr-3 h-5 w-5 flex-shrink-0 ${
                darkMode ? 'text-amber-400' : 'text-amber-500'
              }`} />
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                This assessment is for educational purposes only and is not a substitute for professional medical advice, 
                diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider 
                with any questions you may have regarding a medical condition.
              </p>
            </div>
          </div>
          
          {/* Main Assessment */}
          <div className="space-y-8">
            {/* Overall Assessment */}
            <section>
              <h3 className="text-lg font-medium mb-3">Overall Assessment</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {diagnosticData.overallAssessment}
              </p>
            </section>
            
            {/* Mood Analysis */}
            <section>
              <h3 className="text-lg font-medium mb-3">Mood Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(diagnosticData.moodAnalysis).map(([mood, value]) => (
                  <div 
                    key={mood} 
                    className={`p-3 rounded-lg border ${
                      darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="capitalize">{mood}</span>
                      <span className={`text-sm font-medium ${
                        value > 0.7 
                          ? darkMode ? 'text-red-400' : 'text-red-600'
                          : value > 0.4
                            ? darkMode ? 'text-amber-400' : 'text-amber-600'
                            : darkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${
                      darkMode ? 'bg-gray-600' : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-2 rounded-full ${
                          value > 0.7 
                            ? 'bg-red-500' 
                            : value > 0.4 
                              ? 'bg-amber-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Identified Concerns */}
            {diagnosticData.identifiedConcerns && diagnosticData.identifiedConcerns.length > 0 && (
              <section>
                <h3 className="text-lg font-medium mb-3">Identified Concerns</h3>
                <ul className={`list-disc pl-5 space-y-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {diagnosticData.identifiedConcerns.map((concern, index) => (
                    <li key={index}>{concern}</li>
                  ))}
                </ul>
              </section>
            )}
            
            {/* Coping Mechanisms */}
            {diagnosticData.copingMechanisms && diagnosticData.copingMechanisms.length > 0 && (
              <section>
                <h3 className="text-lg font-medium mb-3">Observed Coping Mechanisms</h3>
                <ul className={`list-disc pl-5 space-y-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {diagnosticData.copingMechanisms.map((mechanism, index) => (
                    <li key={index}>{mechanism}</li>
                  ))}
                </ul>
              </section>
            )}
            
            {/* Recommendations */}
            {diagnosticData.recommendations && diagnosticData.recommendations.length > 0 && (
              <section>
                <h3 className="text-lg font-medium mb-3">Recommendations</h3>
                <div className="space-y-4">
                  {diagnosticData.recommendations.map((recommendation, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${
                        darkMode ? 'border-indigo-800 bg-indigo-900/20' : 'border-indigo-100 bg-indigo-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <Info className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          darkMode ? 'text-indigo-400' : 'text-indigo-500'
                        }`} />
                        <div>
                          <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                            {recommendation.text}
                          </p>
                          {recommendation.resources && recommendation.resources.length > 0 && (
                            <div className="mt-2">
                              <p className={`text-sm font-medium mb-1 ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Suggested Resources:
                              </p>
                              <ul className={`list-disc pl-5 text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {recommendation.resources.map((resource, idx) => (
                                  <li key={idx}>
                                    {resource.url ? (
                                      <a 
                                        href={resource.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`underline ${
                                          darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
                                        }`}
                                      >
                                        {resource.title || resource.url}
                                      </a>
                                    ) : (
                                      resource.title
                                    )}
                                    {resource.description && (
                                      <p className="mt-1">{resource.description}</p>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Follow-up Plan */}
            {diagnosticData.followUpPlan && (
              <section>
                <h3 className="text-lg font-medium mb-3">Follow-up Plan</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {diagnosticData.followUpPlan}
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticSummary; 