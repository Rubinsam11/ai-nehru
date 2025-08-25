import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Wifi, Sparkles, Sun, Moon, Mic, Paperclip, ArrowUp, Camera, MicOff, Video, VideoOff } from 'lucide-react';
import ThreeDLogo from './components/ThreeDLogo';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { useCamera } from './hooks/useCamera';
import { generateAIResponse } from './utils/aiResponses';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: number;
}


function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [inputActive, setInputActive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMicModal, setShowMicModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom hooks
  const { isListening, transcript, startListening, stopListening, isSupported: voiceSupported } = useVoiceRecognition();
  const { speak, isSpeaking, isSupported: ttsSupported, stop: stopSpeaking } = useTextToSpeech();
  const { videoRef, isActive: cameraActive, startCamera, stopCamera, error: cameraError } = useCamera();

  const inputBgClass = isDarkMode ? 'bg-[#232323]' : 'bg-white';

  useEffect(() => {
    if (inputActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputActive]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle voice recognition transcript
  useEffect(() => {
    if (transcript && !isListening) {
      handleSendMessage(transcript);
    }
  }, [transcript, isListening]);

  const handleSendMessage = (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      text: messageText,
      isUser: true,
      timestamp: Date.now()
    };

    // Generate AI response
    const aiResponseText = generateAIResponse(messageText);
    const aiMessage: Message = {
      text: aiResponseText,
      isUser: false,
      timestamp: Date.now() + 1
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    
    // Speak the AI response
    if (ttsSupported) {
      setTimeout(() => speak(aiResponseText), 500);
    }

    setInputValue('');
    setInputActive(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleSendMessage(inputValue);
    }
  };

  const handleCameraClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cameraActive) {
      stopCamera();
      setShowCameraModal(false);
    } else {
      setShowCameraModal(true);
      await startCamera();
    }
  };

  const handleMicClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isListening) {
      stopListening();
      setShowMicModal(false);
    } else {
      setShowMicModal(true);
      startListening();
    }
  };

  const handleFileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
 <div className={` h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]  flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-white'}`}
        style={{
        backgroundImage: "url('/nehru.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
        height: '900px'   

      }}
    >
      {/* 3D Logo - Center when no messages */}
      {messages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ThreeDLogo className="w-64 h-64 sm:w-80 sm:h-80" />
        </div>
      )}

      {/* Mic Modal */}
      {showMicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl px-8 py-6 flex flex-col items-center shadow-lg">
            <Mic className={`w-8 h-8 mb-2 ${isListening ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
            <span className="text-lg font-semibold text-gray-800">
              {isListening ? 'Listening...' : 'Starting...'}
            </span>
            {transcript && (
              <p className="text-sm text-gray-600 mt-2 max-w-xs text-center">
                "{transcript}"
              </p>
            )}
            <button
              onClick={() => {
                stopListening();
                setShowMicModal(false);
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center shadow-lg max-w-md w-full mx-4">
            <div className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            </div>
            {cameraError && (
              <p className="text-red-600 text-sm mb-4">{cameraError}</p>
            )}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  stopCamera();
                  setShowCameraModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Close Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Chat Container */}
      <div
        className={`
          w-full h-full flex flex-col flex-1 justify-end bg-transparent
          ${/* On mobile/tablet: max width and margin, on desktop: full width */''}
          sm:max-w-lg md:max-w-xl lg:max-w-full xl:max-w-full 2xl:max-w-full
          sm:mx-auto lg:mx-0
        `}
      >
        {/* Header */}
        <div 
          className={`
            py-3 px-2 sm:py-4 sm:px-4 flex justify-between items-center
            ${/* On desktop: more padding, on mobile: less */''}
            lg:px-12 xl:px-16
          `}
          style={{ background: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)' }}
        >
          {/* Nehru Icon as Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white">
            <img src="/nehru.jpg" alt="Nehru" className="w-full h-full object-cover" />
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center space-x-2">
            {isSpeaking && (
              <div className="flex items-center space-x-1 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs">Speaking</span>
              </div>
            )}
            {isListening && (
              <div className="flex items-center space-x-1 text-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-xs">Listening</span>
              </div>
            )}
          </div>
          
          {/* Theme Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDarkMode(prev => !prev)}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              title={isDarkMode ? "Switch to Bright Mode" : "Switch to Night Mode"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-end">
          {/* Chat Area */}
          <div
            className={`
              flex flex-col space-y-2 overflow-y-auto
              px-2 sm:px-4
              lg:px-12 xl:px-16
            `}
            style={{ maxHeight: "calc(100vh - 180px)", minHeight: 100 }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"} items-end`}
              >
                {/* AI Avatar for AI messages */}
                {!msg.isUser && (
                  <div className="flex-shrink-0 mr-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-xs shadow">
                      AI
                    </div>
                  </div>
                )}
                <div
                  className={`px-3 py-2 rounded-2xl shadow text-sm sm:text-base md:text-lg max-w-[90vw] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%] ${
                    msg.isUser
                      ? "bg-blue-600 text-white"
                      : isDarkMode
                        ? "bg-white/90 text-gray-900"
                        : "bg-blue-50 text-blue-900"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom Search Bar */}
          <div className={`
            pb-3 pt-2 bg-transparent
            px-2 sm:px-3
            lg:px-12 xl:px-16
          `}>
            <div
              className={`flex items-center rounded-full ${inputBgClass} px-2 sm:px-4 py-2 sm:py-3`}
              style={{
                background: isDarkMode
                  ? "rgba(35,35,35,0.85)"
                  : "rgba(255,255,255,0.85)",
              }}
              onClick={() => setInputActive(true)}
            >
              {/* Camera Icon */}
              <button
                className={`mr-1 sm:mr-2 p-1 rounded-full hover:bg-gray-700 ${cameraActive ? 'text-green-400' : 'text-gray-400'}`}
                onClick={handleCameraClick}
                type="button"
                title={cameraActive ? "Stop Camera" : "Start Camera"}
              >
                {cameraActive ? (
                  <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Input */}
              {inputActive ? (
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 bg-transparent outline-none text-gray-100 text-sm sm:text-base md:text-lg px-1 sm:px-2"
                  placeholder="Ask anything"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={() => setInputActive(false)}
                  onKeyDown={handleInputKeyDown}
                />
              ) : (
                <span className="flex-1 text-gray-300 text-sm sm:text-base md:text-lg select-none">
                  Ask anything
                </span>
              )}

              {/* Action Icons */}
              <button
                className={`ml-1 sm:ml-2 p-1 rounded-full hover:bg-gray-700 ${isListening ? 'text-red-400' : 'text-gray-400'}`}
                onClick={handleMicClick}
                type="button"
                title={isListening ? "Stop Listening" : "Start Voice Input"}
                disabled={!voiceSupported}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
              
              <button
                className="ml-1 sm:ml-2 p-1 rounded-full hover:bg-gray-700"
                onClick={handleFileClick}
                type="button"
              >
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={() => {}}
              />
              
              <button
                className="ml-1 sm:ml-2 p-1 rounded-full hover:bg-blue-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendMessage(inputValue);
                }}
                type="button"
              >
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className={`
            flex items-center justify-center space-x-6 sm:space-x-8 md:space-x-12 pb-3 sm:pb-4
            lg:px-12 xl:px-16
          `}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-black hover:text-blue-600" />
            </div>
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-700 cursor-pointer">
              <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 hover:text-blue-400" />
              <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-700 cursor-pointer">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 hover:text-blue-400" />
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-700 cursor-pointer">
              <Wifi className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 hover:text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;