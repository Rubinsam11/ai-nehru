
  import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Wifi, Sparkles, Sun, Moon, Mic, Paperclip, ArrowUp, Camera, MicOff, Video } from 'lucide-react';
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

  // Hooks
  const { isListening, transcript, startListening, stopListening, isSupported: voiceSupported } = useVoiceRecognition();
  const { speak, isSpeaking, isSupported: ttsSupported, stop: stopSpeaking } = useTextToSpeech();
  const { videoRef, isActive: cameraActive, startCamera, stopCamera, error: cameraError } = useCamera();

  const inputBgClass = isDarkMode ? 'bg-[#232323]' : 'bg-white';

  useEffect(() => {
    if (inputActive && inputRef.current) inputRef.current.focus();
  }, [inputActive]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (transcript && !isListening) handleSendMessage(transcript);
  }, [transcript, isListening]);

  const handleSendMessage = (messageText: string) => {
    if (!messageText.trim()) return;
    const userMessage: Message = { text: messageText, isUser: true, timestamp: Date.now() };
    const aiResponseText = generateAIResponse(messageText);
    const aiMessage: Message = { text: aiResponseText, isUser: false, timestamp: Date.now() + 1 };

    setMessages(prev => [...prev, userMessage, aiMessage]);

    if (ttsSupported) {
      // stop any ongoing speech first for snappier UX
      try { stopSpeaking?.(); } catch {}
      setTimeout(() => speak(aiResponseText), 300);
    }

    setInputValue('');
    setInputActive(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) handleSendMessage(inputValue);
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
    <div className="flex flex-col w-full h-screen bg-transparent relative">

      {/* Center 3D Logo when no messages */}
      {messages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ThreeDLogo className="w-40 h-40 sm:w-64 sm:h-64" />
        </div>
      )}

      {/* Mic Modal */}
      {showMicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg px-6 py-4 flex flex-col items-center shadow-md w-[90%] max-w-xs">
            <Mic className={`w-6 h-6 mb-2 ${isListening ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
            <span className="text-base font-semibold text-gray-800">
              {isListening ? 'Listening...' : 'Starting...'}
            </span>
            {transcript && (
              <p className="text-xs text-gray-600 mt-2 text-center break-words">
                {`"${transcript}"`}
              </p>
            )}
            <button
              onClick={() => { stopListening(); setShowMicModal(false); }}
              className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded-md text-sm"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-4 w-[92%] max-w-sm flex flex-col items-center shadow-md">
            <div className="w-full aspect-video bg-black rounded overflow-hidden mb-3">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            </div>
            {cameraError && <p className="text-red-600 text-xs mb-2">{cameraError}</p>}
            <button
              onClick={() => { stopCamera(); setShowCameraModal(false); }}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm"
            >
              Close Camera
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className="px-2 py-2 sm:px-4 sm:py-3 flex justify-between items-center"
        style={{ background: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)' }}
      >
        {/* Avatar uses /nehru.jpg from public */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white">
          <img src="/nehru.jpg" alt="Nehru" className="w-full h-full object-cover" />
        </div>

        {/* Status indicators (compact) */}
        <div className="flex items-center space-x-1 text-xs">
          {isSpeaking && <span className="text-green-400">🔊</span>}
          {isListening && <span className="text-red-400">🎤</span>}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(prev => !prev)}
          className="p-1 sm:p-2 rounded-full bg-gray-800 hover:bg-gray-700"
          title={isDarkMode ? 'Switch to Bright Mode' : 'Switch to Night Mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-yellow-400" />
          ) : (
            <Moon className="w-4 h-4 text-gray-700" />
          )}
        </button>
      </div>

      {/* Chat Area */}
      <div
        className="flex-1 flex flex-col overflow-y-auto px-2 sm:px-4 lg:px-10"
        style={{ maxHeight: 'calc(100vh - 160px)' }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} mb-2 items-end`}>
            {!msg.isUser && (
              <div className="w-6 h-6 mr-1 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold">
                AI
              </div>
            )}
            <div
              className={`px-3 py-2 rounded-2xl text-sm max-w-[80%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%] break-words ${
                msg.isUser
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'bg-white/90 text-gray-900'
                    : 'bg-blue-50 text-blue-900'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="px-2 pb-2 sm:px-4">
        <div
          className={`flex items-center rounded-full ${inputBgClass} px-2 py-2`}
          style={{ background: isDarkMode ? 'rgba(35,35,35,0.85)' : 'rgba(255,255,255,0.85)' }}
          onClick={() => setInputActive(true)}
        >
          {/* Camera */}
          <button
            className={`p-1 rounded-full ${cameraActive ? 'text-green-400' : 'text-gray-400'} hover:text-green-400`}
            onClick={handleCameraClick}
            type="button"
            title={cameraActive ? 'Stop Camera' : 'Start Camera'}
          >
            {cameraActive ? <Video className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          </button>

          {/* Input */}
          {inputActive ? (
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent outline-none text-xs sm:text-sm md:text-base text-gray-100 px-2"
              placeholder="Ask anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => setInputActive(false)}
              onKeyDown={handleInputKeyDown}
            />
          ) : (
            <span className="flex-1 text-gray-400 text-xs sm:text-sm md:text-base select-none px-2">
              Ask anything...
            </span>
          )}

          {/* Mic */}
          <button
            className={`p-1 rounded-full ${isListening ? 'text-red-400' : 'text-gray-400'} hover:text-red-400`}
            onClick={handleMicClick}
            type="button"
            title={isListening ? 'Stop Listening' : 'Start Voice Input'}
            disabled={!voiceSupported}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Attach */}
          <button
            className="p-1 rounded-full text-gray-400 hover:text-gray-300"
            onClick={handleFileClick}
            type="button"
            title="Attach a file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={() => {}} />

          {/* Send */}
          <button
            className="p-1 ml-1 rounded-full hover:bg-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              handleSendMessage(inputValue);
            }}
            type="button"
            title="Send"
          >
            <ArrowUp className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-center space-x-6 pb-2 sm:pb-4">
        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer">
          <Search className="w-4 h-4 text-black" />
        </div>
        <div className="relative w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-700 cursor-pointer">
          <Plus className="w-6 h-6 text-gray-400" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
        </div>
        <div className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-700 cursor-pointer">
          <Sparkles className="w-6 h-6 text-gray-400" />
        </div>
        <div className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-700 cursor-pointer">
          <Wifi className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

export default App;
