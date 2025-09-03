import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Maximize, Minimize, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  image?: string;
}

const formatMessage = (text: string) => {
  return text
    // Format code blocks with backticks
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg my-2 overflow-x-auto"><code class="text-sm font-mono text-gray-800 dark:text-gray-200">$2</code></pre>')
    // Format inline code with single backticks
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-sunshine-violet">$1</code>')
    // Format text between asterisks as italic
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    // Format bold text with double asterisks
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>')
    // Format links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sunshine-violet hover:text-sunshine-blue underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Convert newlines to <br> tags
    .replace(/\n/g, '<br>');
};

export default function ChatAssistant() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          text: t('chat.initialMessage'),
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, t, messages.length]);

  useEffect(() => {
    const handleLanguageChanged = () => {
      if (messages.length > 0) {
        setMessages([
          {
            text: t('chat.initialMessage'),
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n, t, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        const userMessage: Message = {
          text: t('chat.imageUploaded') || 'Image uploaded',
          sender: 'user',
          timestamp: new Date(),
          image: imageDataUrl
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Automatically send the image for analysis
        sendMessage(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async (imageData?: string) => {
    if ((!inputMessage.trim() && !imageData) || isLoading) return;

    if (!imageData) {
      const userMessage: Message = {
        text: inputMessage,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
    }
    
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.DEV 
        ? 'http://localhost:8890/.netlify/functions/chat'
        : '/.netlify/functions/chat';
      
            interface RequestBody {
  message: string;
  language: string;
  image?: string;
}

// ... (keep the existing code until the requestBody declaration)

      const requestBody: RequestBody = {
        message: messageToSend || t('chat.analyzeImage') || 'Please analyze this image',
        language: i18n.language.split('-')[0]
      };
      
      if (imageData) {
        requestBody.image = imageData;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage: Message = {
        text: data.response || t('chat.noResponse'),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage: Message = {
        text: `${t('chat.errorPrefix')}: ${error instanceof Error ? error.message : t('chat.unknownError')}`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-sunshine-violet to-sunshine-blue shadow-xl transition-all duration-200 hover:scale-110 hover:shadow-2xl"
        aria-label={t('chat.ariaLabel')}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bg-white dark:bg-gray-800 shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isFullscreen 
            ? 'inset-0 z-50 rounded-none' 
            : 'bottom-24 right-6 w-96 h-[500px] rounded-2xl z-40'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-sunshine-violet to-sunshine-blue text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold text-lg">{t('chat.header')}</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:text-gray-200 transition-colors"
                title={isFullscreen ? t('chat.minimizeWindow') : t('chat.maximizeWindow')}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${message.sender === 'user' ? 'whitespace-pre-wrap' : ''} ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-sunshine-violet to-sunshine-blue text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="Uploaded image" 
                      className="max-w-full h-auto rounded-lg mb-2 cursor-pointer"
                      onClick={() => window.open(message.image, '_blank')}
                    />
                  )}
                  {message.sender === 'user' ? (
                    message.text
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }} />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                title={t('chat.uploadImage')}
              >
                <Image className="h-4 w-4" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chat.inputPlaceholder')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sunshine-violet"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-sunshine-violet to-sunshine-blue text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Responsive Overlay */}
      {isOpen && !isFullscreen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" onClick={() => setIsOpen(false)} />
      )}
      
      <style>{`
        @media (max-width: 768px) {
          .fixed.bottom-24.right-6:not(.inset-4) {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 0 !important;
            z-index: 50 !important;
          }
        }
      `}</style>
    </>
  );
}