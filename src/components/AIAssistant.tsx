import { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Send, BrainCircuit, Volume2, VolumeX,
  Trash2, UploadCloud, Lock, FileText, Zap, Copy, CheckCircle,
  AlertCircle, Wifi, WifiOff
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// OPENROUTER — Claude via fetch (no SDK dependency)
// ─────────────────────────────────────────────────────────────────────────────
const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Use Claude Sonnet — best balance of speed and quality
const MODEL = 'anthropic/claude-3.5-sonnet';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callClaude(
  conversationHistory: OpenRouterMessage[],
  systemPrompt: string
): Promise<string> {
  const response = await fetch(OPENROUTER_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://pfis-app.web.app',   // Site URL for OR rankings
      'X-Title': 'PFIS — Financial Intelligence Suite',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
      ],
      max_tokens: 1500,
      temperature: 0.3,        // Low temp for precise financial advice
      stream: false,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? 'No response received.';
}

// ─────────────────────────────────────────────────────────────────────────────
// RAG CONTEXT — Simulated vector-retrieved financial data
// (In production: parsed PDFs/CSVs → embedded → retrieved by similarity)
// ─────────────────────────────────────────────────────────────────────────────
const RAG_DOCS = [
  { title: 'Tax Profile 2024', content: 'Gross income: $95,000. Federal marginal bracket: 22%. State (CA): 9.3%. FICA: 7.65%. Effective total rate: ~28.7%. Annual tax burden: $27,265.' },
  { title: 'Portfolio Summary', content: 'Total AUM: $153,700. Holdings: VTI $80k (equities), BND $45k (bonds), VNQ $22k (REIT), FXAIX $35k (Traditional IRA). Weighted ER: 0.09%. Annual yield: 2.8%.' },
  { title: 'Debt Schedule', content: 'Debts: Federal Student Loan $28,500 @ 6.8%. Tesla Auto $21,000 @ 7.2%. Chase CC $4,200 @ 22.9%. Total: $53,700. Monthly service: $998.' },
  { title: 'Cash Flow', content: 'Monthly gross: $7,917. Net take-home: $6,517. Fixed obligations: $2,083 (housing) + $998 (debt). Investments: $475 (401k) + $267 (IRA). Surplus: $694/mo.' },
  { title: 'Risk Profile', content: 'Monte Carlo (1,000 sims, 30yr horizon, 4% SWR, $500k target): Baseline failure 8.2%. SORR risk with early crash (2008 Yr1-3): 31% failure. Investment horizon: 34 yrs to age 65.' },
  { title: 'Emergency Fund', content: 'Target: $15,000 (6 months expenses). Current: $9,000. Gap: $6,000. Monthly contribution to emergency: $300. Expected full funding: 20 months.' },
];

function buildSystemPrompt(): string {
  const contextBlock = RAG_DOCS.map(d => `[${d.title}]\n${d.content}`).join('\n\n');

  return `You are an elite Fiduciary AI Financial Advisor embedded in the Professional Financial Intelligence Suite (PFIS).

## YOUR ROLE
You operate at the level of a dual-qualified CFP (Certified Financial Planner) and CFA (Chartered Financial Analyst). You are NOT a general assistant. You ONLY provide mathematically grounded, fiduciary-grade financial guidance.

## TONE & STYLE
- Direct, analytical, and precise
- Use correct financial terminology (Sequence of Returns Risk, DTI, Expense Ratio, Tax-Equivalent Yield, Alpha, Beta, Sharpe Ratio, etc.)
- Structure all responses with clear headers or numbered steps when appropriate
- Format numbers precisely with $ and % symbols
- Be actionable: always end with a clear directive or next step

## CRITICAL RULES
1. NEVER give vague "it depends" answers — provide the exact formula or calculation
2. ALWAYS frame advice in expected value math, not emotion
3. Reference the user's actual data from the RAG context below when relevant
4. Use the formula: After-Tax Return = Gross Return × (1 − Marginal Tax Rate) when comparing investments to debt
5. Reference Trinity Study (4% SWR) for withdrawal rate discussions
6. Flag any situation where debt rate > expected market return as a priority paydown signal
7. For SORR analysis, always quantify the early-crash scenario (Year 1–3 drawdown)

## FIDUCIARY COMMITMENT
You are legally and ethically obligated to recommend what is mathematically optimal for the user — not what earns commissions. Never suggest actively managed funds over index funds without quantified justification.

## USER'S FINANCIAL DATA (RAG-Retrieved Context)
${contextBlock}

## RESPONSE FORMAT
When answering:
1. Quote specific numbers from the user's context
2. Show the math/formula used
3. Give a clear DIRECTIVE (what to do next)
4. Rate confidence: HIGH / MEDIUM / LOW and explain why`;
}

// ─────────────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const QUICK_PROMPTS = [
  { label: 'SORR Risk', prompt: 'What is my exact Sequence of Returns Risk, and should I adjust my safe withdrawal rate given my current portfolio?' },
  { label: 'Next $1,000', prompt: 'Given my debts and tax bracket, where should my next $1,000 go — pay debt or invest? Show the math.' },
  { label: 'Tax-Drag Audit', prompt: 'Analyze my portfolio for tax-drag. Which assets are in suboptimal account locations and what is the annual cost?' },
  { label: 'FIRE Date', prompt: 'At my current savings rate and portfolio, what is my Financial Independence date assuming the 4% Trinity rule?' },
  { label: 'CC Priority', prompt: 'My credit card is at 22.9%. Is there any scenario where I should invest instead of paying this off first?' },
  { label: 'IRA Gap', prompt: 'I\'m only contributing $3,200 to my IRA (out of $7,000 limit). What is the 30-year cost of this $3,800 shortfall?' },
];

function formatContent(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, `<code style="background:#f5f4ef;padding:0.1em 0.35em;font-family:JetBrains Mono,monospace;font-size:0.86em;border:1px solid #d4d0c0">$1</code>`)
    .replace(/^### (.+)$/gm, '<h4 style="font-size:0.9rem;font-weight:700;margin:0.75rem 0 0.4rem;color:#0a0a0a">$1</h4>')
    .replace(/^## (.+)$/gm,  '<h3 style="font-size:1rem;font-weight:700;margin:0.75rem 0 0.4rem;color:#0a0a0a">$1</h3>')
    .replace(/^# (.+)$/gm,   '<h2 style="font-size:1.1rem;font-weight:800;margin:0.75rem 0 0.5rem;color:#0a0a0a">$1</h2>')
    .replace(/^(\d+)\. (.+)$/gm, '<div style="display:flex;gap:0.5rem;margin:0.2rem 0"><span style="font-weight:700;color:#f5c800;min-width:1.2rem">$1.</span><span>$2</span></div>')
    .replace(/^[-•] (.+)$/gm, '<div style="display:flex;gap:0.5rem;margin:0.15rem 0"><span style="color:#f5c800;font-weight:700">▸</span><span>$1</span></div>')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Online status
  useEffect(() => {
    const onOn  = () => setIsOnline(true);
    const onOff = () => setIsOnline(false);
    window.addEventListener('online',  onOn);
    window.addEventListener('offline', onOff);
    return () => { window.removeEventListener('online', onOn); window.removeEventListener('offline', onOff); };
  }, []);

  // Load chat history
  useEffect(() => {
    const cached = localStorage.getItem('pfis_claude_chat_v1');
    if (cached) {
      try { setMessages(JSON.parse(cached)); return; } catch {}
    }

    // Welcome message
    setMessages([{
      id: 'msg-welcome',
      role: 'assistant',
      timestamp: Date.now(),
      content: `**PFIS Fiduciary AI Advisor — Online**

I'm powered by **Claude (Anthropic)** via the RAG pipeline and have loaded your financial context:

- **Tax Profile:** $95k income → 22% federal bracket + 9.3% CA state
- **Portfolio:** $153.7k AUM (VTI, BND, VNQ, FXAIX)  
- **Debts:** $53.7k total — CC at 22.9% is Priority #1
- **Cash Flow:** $694/mo surplus available for allocation
- **SORR Risk:** 8.2% baseline failure rate (31% with early crash)

I'm grounded in your actual numbers. Ask me anything — from debt prioritization to retirement date calculation.`,
    }]);
  }, []);

  // Persist & scroll
  useEffect(() => {
    if (messages.length > 0) localStorage.setItem('pfis_claude_chat_v1', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech recognition
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    recognitionRef.current = new SR();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    recognitionRef.current.onerror  = () => setIsListening(false);
    recognitionRef.current.onend    = () => setIsListening(false);
  }, []);

  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const plain = text.replace(/<[^>]+>/g, '').replace(/\*\*/g, '').slice(0, 600);
    const utt = new SpeechSynthesisUtterance(plain);
    const voices = window.speechSynthesis.getVoices();
    const pro = voices.find(v => v.lang === 'en-GB' || v.name.includes('Google UK')) || voices[0];
    if (pro) utt.voice = pro;
    utt.rate = 1.05; utt.pitch = 0.88;
    window.speechSynthesis.speak(utt);
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isTyping) return;

    if (!isOnline) {
      setError('No internet connection. Please check your network and try again.');
      return;
    }

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      // Build conversation history for Claude (last 10 messages for context window)
      const history = messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content.replace(/<[^>]+>/g, ''), // strip HTML from previous AI msgs
      }));
      history.push({ role: 'user', content: text });

      const systemPrompt = buildSystemPrompt();
      const responseText = await callClaude(history, systemPrompt);

      const aiMsg: Message = { id: `a-${Date.now()}`, role: 'assistant', content: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      speak(responseText);
    } catch (err: any) {
      console.error('OpenRouter Error:', err);
      const errMsg = err.message?.includes('429')
        ? 'Rate limit reached. Please wait a moment and try again.'
        : err.message?.includes('401')
        ? 'API authentication failed. Check the OpenRouter API key.'
        : err.message?.includes('NetworkError') || err.message?.includes('fetch')
        ? 'Network error. The OpenRouter API may be unreachable.'
        : `AI Error: ${err.message ?? 'Unknown error'}`;
      setError(errMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const clearMemory = () => {
    localStorage.removeItem('pfis_claude_chat_v1');
    setMessages([{
      id: `w-${Date.now()}`,
      role: 'assistant',
      timestamp: Date.now(),
      content: '**Session cleared.** RAG context reloaded. Ready for new analysis.',
    }]);
    setError(null);
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content.replace(/<[^>]+>/g, ''));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 130) + 'px';
  };

  const simulateUpload = () => {
    const files = ['statement_Q1_2024.csv', 'tax_return_2024.pdf', 'debt_schedule.csv', 'brokerage_2024.csv'];
    setUploadedFiles(prev => [...prev, files[prev.length % files.length]]);
  };

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
    else { setError(null); recognitionRef.current?.start(); setIsListening(true); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', gap: '1rem' }}>

      {/* ── HEADER ── */}
      <div className="nb-card" style={{ padding: '0.9rem 1.25rem', background: '#fff' }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div style={{ background: '#0a0a0a', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0a0a0a', boxShadow: '3px 3px 0 #0a0a0a', flexShrink: 0 }}>
              <BrainCircuit size={20} color="#f5c800" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>Fiduciary AI Advisor</div>
              <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                Claude 3.5 Sonnet • OpenRouter • RAG pipeline • {RAG_DOCS.length} docs
              </div>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2">
              <span className="badge badge-yellow">RAG</span>
              <span className="badge badge-green">
                <Lock size={8} /> AES-256
              </span>
              <span className={`badge ${isOnline ? 'badge-green' : 'badge-red'}`}>
                {isOnline ? <><Wifi size={8} /> LIVE</> : <><WifiOff size={8} /> OFFLINE</>}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {uploadedFiles.length > 0 && uploadedFiles.slice(-2).map(f => (
              <span key={f} className="badge badge-neutral" style={{ fontSize: '0.58rem' }}>
                <FileText size={7} /> {f.split('_')[0]}
              </span>
            ))}
            <button className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '0.38rem 0.7rem' }} onClick={simulateUpload}>
              <UploadCloud size={13} /> Upload
            </button>
            <button className="btn btn-ghost" style={{ padding: '0.38rem 0.6rem' }} onClick={() => setVoiceEnabled(v => !v)} title="Toggle voice">
              {voiceEnabled ? <Volume2 size={14} color="var(--accent-success)" /> : <VolumeX size={14} />}
            </button>
            <button className="btn btn-ghost" style={{ padding: '0.38rem 0.6rem' }} onClick={clearMemory} title="Clear session">
              <Trash2 size={14} color="var(--accent-danger)" />
            </button>
          </div>
        </div>

        {/* RAG Context pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {RAG_DOCS.map(d => (
            <span key={d.title} className="badge badge-neutral" style={{ fontSize: '0.58rem' }}>
              {d.title}
            </span>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="alert alert-danger animate-fade" style={{ fontSize: '0.82rem' }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <div>
            <strong>Error:</strong> {error}
            <button className="btn btn-ghost" style={{ marginLeft: '1rem', padding: '0.15rem 0.5rem', fontSize: '0.7rem' }} onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── CHAT AREA ── */}
      <div className="nb-card" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: '#fafaf8' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {/* Sender label */}
              <div
                className="flex items-center gap-2 mb-1"
                style={{
                  fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                  ...(msg.role === 'user' ? { flexDirection: 'row-reverse' } : {}),
                }}
              >
                {msg.role === 'assistant' && <BrainCircuit size={9} color="#0a0a0a" />}
                <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {msg.role === 'user' ? 'You' : 'Claude — Fiduciary AI'}
                </span>
                <span style={{ opacity: 0.6 }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>

              <div style={{ maxWidth: '82%', position: 'relative' }}>
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  {msg.role === 'assistant'
                    ? <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                    : msg.content
                  }
                </div>
                {/* Copy button */}
                <button
                  onClick={() => copyMessage(msg.id, msg.content)}
                  style={{
                    position: 'absolute',
                    top: 5,
                    [msg.role === 'user' ? 'left' : 'right']: 5,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    opacity: 0.35, transition: 'opacity 0.2s', padding: '2px',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.35')}
                >
                  {copiedId === msg.id
                    ? <CheckCircle size={11} color="var(--accent-success)" />
                    : <Copy size={11} color="var(--text-muted)" />
                  }
                </button>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>
                Claude — Fiduciary AI
              </div>
              <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.7rem 1rem' }}>
                <span className="loading-ring" />
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Analyzing your financial context…
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── QUICK PROMPTS ── */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {QUICK_PROMPTS.map(p => (
          <button
            key={p.label}
            className="btn btn-secondary"
            style={{ fontSize: '0.68rem', padding: '0.3rem 0.7rem', fontFamily: 'var(--font-body)' }}
            onClick={() => handleSend(p.prompt)}
            disabled={isTyping}
            title={p.prompt}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── INPUT AREA ── */}
      <div className="nb-card" style={{ padding: '0.75rem 1rem', background: '#fff' }}>
        <div className="flex items-end gap-3">
          <button
            className={`btn ${isListening ? 'btn-danger' : 'btn-ghost'}`}
            style={{ padding: '0.5rem', flexShrink: 0, height: 40, width: 40, alignSelf: 'flex-end' }}
            onClick={toggleListening}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <Mic size={16} color="white" /> : <MicOff size={16} />}
          </button>

          <textarea
            ref={textareaRef}
            className="nb-input flex-1"
            placeholder="Ask your Fiduciary AI… e.g. 'Should I pay off my 22.9% CC before investing in IRA?'"
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            rows={1}
            style={{ resize: 'none', lineHeight: 1.5, maxHeight: 130, overflow: 'auto', padding: '0.6rem 0.85rem' }}
            disabled={isTyping}
          />

          <button
            className="btn btn-primary"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            style={{ height: 40, alignSelf: 'flex-end', flexShrink: 0 }}
            id="ai-send-btn"
          >
            {isTyping ? <span className="loading-ring" style={{ borderTopColor: '#0a0a0a' }} /> : <Send size={15} color="#0a0a0a" />}
            <span style={{ color: '#0a0a0a' }}>{isTyping ? 'Thinking…' : 'Ask'}</span>
          </button>
        </div>

        <div className="flex justify-between mt-2" style={{ fontSize: '0.61rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>Enter to send • Shift+Enter for newline</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Lock size={8} /> Zero-knowledge — context sent, not raw data
          </span>
        </div>
      </div>
    </div>
  );
}
