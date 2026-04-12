import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, BrainCircuit, Loader2, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with the provided key
const API_KEY = 'AIzaSyALN3KBCbIIbTa7KjH6QUrRqPysxh7uSr0';
const genAI = new GoogleGenerativeAI(API_KEY);

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load cache on mount
  useEffect(() => {
    const cachedData = localStorage.getItem('pfis_ai_chat');
    if (cachedData) {
      try {
        setMessages(JSON.parse(cachedData));
      } catch (e) {
        console.error('Failed to parse cached chat data', e);
      }
    } else {
      // Initial greeting
      setMessages([{
        id: 'msg-0',
        role: 'assistant',
        content: 'Welcome to your Professional Financial Intelligence Suite AI. I am your fiduciary AI advisor. I can analyze debt arbitrage, explain complex actuarial concepts like Sequence of Returns Risk, or guide your initial capital allocations. How can I quantitatively assist you today?',
        timestamp: Date.now()
      }]);
    }

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setError('Voice recognition error: ' + event.error);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Voice recognition is not supported in this browser.');
    }
  }, []);

  // Save to cache when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('pfis_ai_chat', JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Attempt to make it sound professional (UK English or specific pitch)
    const voices = window.speechSynthesis.getVoices();
    const proVoice = voices.find(v => v.lang.includes('en-GB') || v.name.includes('Google UK English')) || voices[0];
    if (proVoice) utterance.voice = proVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError(null);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const clearMemory = () => {
    localStorage.removeItem('pfis_ai_chat');
    setMessages([{
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: 'Cache cleared. System reset. I am your fiduciary AI advisor. How can I assist you?',
      timestamp: Date.now()
    }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      // Build prompt context
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      const systemContext = `You are an elite, highly professional AI Financial Advisor working inside the "Professional Financial Intelligence Suite (PFIS)". 
Tone: Fiduciary, analytical, concise, and highly intelligent. Use financial terminology accurately (e.g., Sequence of Returns Risk, Debt-to-Income, Arbitrage, Alpha/Beta, Cap Rates). 
Keep responses highly structured, practical, and avoid generic fluff.
The user just asked: ${userMsg.content}`;

      const result = await model.generateContent(systemContext);
      const responseText = result.response.text();

      const aiMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
      speak(responseText);

    } catch (err: any) {
      console.error(err);
      setError('AI Engine Error: Unable to process request. Check API configuration.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-col" style={{ height: 'calc(100vh - 150px)', display: 'flex' }}>
      
      {/* Header Panel */}
      <div className="glass-panel p-4 flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2" style={{ background: 'var(--accent-primary)', borderRadius: '8px' }}>
            <BrainCircuit size={24} color="white" />
          </div>
          <div>
            <h3>Fiduciary AI Advisor</h3>
            <p className="label" style={{ fontSize: '0.75rem' }}>Powered by Gemini Enterprise Intelligence</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            className="btn btn-glass p-2" 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
          >
            {voiceEnabled ? <Volume2 size={18} color="var(--accent-success)" /> : <VolumeX size={18} color="var(--text-secondary)" />}
          </button>
          <button 
            className="btn btn-glass p-2" 
            onClick={clearMemory}
            title="Clear Cached Memory"
          >
            <Trash2 size={18} color="var(--accent-danger)" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Chat Area */}
      <div className="glass-panel p-6 flex flex-col mb-4" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="flex flex-col gap-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                style={{ 
                  maxWidth: '75%', 
                  padding: '1rem', 
                  borderRadius: '12px',
                  background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                  boxShadow: msg.role === 'user' ? '0 4px 14px 0 rgba(59, 130, 246, 0.39)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', borderBottom: msg.role === 'user' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>
                  {msg.role === 'assistant' && <BrainCircuit size={14} color="var(--accent-primary)" />}
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                    {msg.role === 'user' ? 'PRINCIPAL' : 'AI MODEL'}
                  </span>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)' }}>
                <Loader2 size={20} className="animate-spin" color="var(--accent-primary)" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="glass-panel p-4 flex gap-3 items-center">
        <button 
          className={`btn p-3 ${isListening ? 'btn-primary' : 'btn-glass'}`} 
          onClick={toggleListening}
          style={{ borderRadius: '50%' }}
        >
          {isListening ? <Mic size={20} color="white" /> : <MicOff size={20} color="var(--text-secondary)" />}
        </button>
        
        <input 
          type="text" 
          className="input flex-1" 
          placeholder="Dictate or type your complex financial logic queries..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)' }}
        />
        
        <button 
          className="btn btn-primary" 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
        >
          <Send size={18} />
          <span>Execute</span>
        </button>
      </div>

    </div>
  );
}
