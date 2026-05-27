import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, ChevronDown } from 'lucide-react';

// ─── Shared context shape ─────────────────────────────────────────────────────
// Both Ordinance and AssignedOrdinance get mapped into this before passing in.
export interface ChatOrdinanceContext {
  number: string;
  title: string;
  category: string;
  summary: string;
  offices: string[];          // implementing offices (may be empty)
  datePassed?: string;        // encoder view has this
  deadline?: string;          // dept head view has this
  publishedBy?: string;
  complianceStatus?: string;  // dept head only
  progress?: number;          // dept head only
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  ts: number;
}

interface OrdinanceChatbotProps {
  ordinance: ChatOrdinanceContext;
  /** 'encoder' uses navy theme, 'dept' uses teal theme */
  theme?: 'encoder' | 'dept';
}

// ─── Suggested questions ─────────────────────────────────────────────────────
const SUGGESTED: string[] = [
  'What is this ordinance about?',
  'Who needs to comply?',
  'What are the penalties?',
  'Which offices are responsible?',
  'What are the key deadlines?',
  'Give me a plain-language summary.',
];

// ─── Simulated AI response engine ────────────────────────────────────────────
// In production this would call an LLM API with the ordinance as context.
// For the mockup it pattern-matches the question against the ordinance data.
function generateResponse(q: string, ord: ChatOrdinanceContext): string {
  const ql = q.toLowerCase();

  if (ql.includes('about') || ql.includes('what is') || ql.includes('summary') || ql.includes('plain')) {
    return `**${ord.number} — ${ord.title}**\n\n${ord.summary}\n\nThis is a **${ord.category}** ordinance${ord.datePassed ? ` passed on ${ord.datePassed}` : ''}.`;
  }

  if (ql.includes('penalt') || ql.includes('fine') || ql.includes('violation') || ql.includes('sanction')) {
    return `Under this ordinance, violations are penalized as follows:\n\n• **1st offense** — Fine of ₱500 or 8 hours community service\n• **2nd offense** — Fine of ₱1,000 or 16 hours community service\n• **3rd offense and beyond** — Fine of ₱2,000 plus mandatory attendance in an awareness seminar\n\nRepeated non-compliance may also result in referral to the appropriate regulatory body.`;
  }

  if (ql.includes('office') || ql.includes('responsible') || ql.includes('implement') || ql.includes('enforce') || ql.includes('who')) {
    const offices = ord.offices.length
      ? ord.offices.map(o => `• ${o}`).join('\n')
      : '• No specific offices have been assigned yet.';
    return `The following offices are responsible for implementing **${ord.number}**:\n\n${offices}\n\nBarangay captains are also deputized to issue citations within their respective jurisdictions.`;
  }

  if (ql.includes('deadline') || ql.includes('due') || ql.includes('when') || ql.includes('date') || ql.includes('effectiv')) {
    const parts: string[] = [];
    if (ord.datePassed && ord.datePassed !== '—') parts.push(`• **Date passed:** ${ord.datePassed}`);
    if (ord.deadline) parts.push(`• **Compliance deadline:** ${ord.deadline}`);
    parts.push(`• **Effectivity:** 15 days after publication in a newspaper of general circulation in Cebu City.`);
    parts.push(`• Implementing offices must issue supplemental guidelines within **30 days** of effectivity.`);
    return parts.join('\n');
  }

  if (ql.includes('comply') || ql.includes('who must') || ql.includes('applies') || ql.includes('scope') || ql.includes('coverage')) {
    return `**${ord.number}** applies to all residents, establishments, institutions, and individuals within the territorial jurisdiction of **Cebu City**, including all 80 barangays.\n\nSpecifically, it covers:\n• All persons subject to the ${ord.category.toLowerCase()} regulations described\n• Commercial and institutional establishments within the city\n• Government offices assigned as implementing agencies`;
  }

  if (ql.includes('compliance') || ql.includes('progress') || ql.includes('status')) {
    if (ord.complianceStatus !== undefined) {
      const statusMap: Record<string, string> = {
        compliant: '✅ **Fully Compliant** — All requirements have been met.',
        'in-progress': `🔄 **In Progress** — Implementation is ongoing at **${ord.progress ?? 0}%** completion.`,
        delayed: '⚠️ **Delayed** — Implementation is behind schedule. Immediate action is required.',
        pending: '⏳ **Pending** — No implementation actions have been recorded yet.',
      };
      return `Current compliance status for your office:\n\n${statusMap[ord.complianceStatus] ?? 'Status unknown.'}\n\n${ord.deadline ? `Deadline: **${ord.deadline}**` : ''}`;
    }
    return `This ordinance is currently **${ord.category}** category and is in **active** status. Implementing offices are expected to submit compliance reports within 30 days of effectivity.`;
  }

  if (ql.includes('article') || ql.includes('section') || ql.includes('provision') || ql.includes('text') || ql.includes('full')) {
    return `The full text of **${ord.number}** is organized into four articles:\n\n• **Article I** — General Provisions (Title, Scope, Policy)\n• **Article II** — ${ord.category} Standards and Requirements\n• **Article III** — Prohibited Acts and Penalties\n• **Article IV** — Implementing Authority and Effectivity\n\nYou can read the complete text in the **Full Text** tab above.`;
  }

  if (ql.includes('publish') || ql.includes('author') || ql.includes('encod') || ql.includes('who made')) {
    return `**${ord.number}** was ${ord.publishedBy ? `encoded and published by **${ord.publishedBy}**` : 'published by the City Council Office'}${ord.datePassed && ord.datePassed !== '—' ? ` on **${ord.datePassed}**` : ''}.`;
  }

  if (ql.includes('category') || ql.includes('type') || ql.includes('classif')) {
    return `This ordinance is classified under the **${ord.category}** category. It falls within the regulatory framework for ${ord.category.toLowerCase()}-related policies of Cebu City.`;
  }

  // Fallback
  return `Based on the ordinance document for **${ord.number} — ${ord.title}**:\n\n${ord.summary}\n\nIf you have a more specific question about penalties, implementing offices, deadlines, or the full text, feel free to ask and I'll pull the relevant details for you.`;
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────
function getTheme(t: 'encoder' | 'dept') {
  return t === 'dept'
    ? { primary: '#10B981', primaryDark: '#059669', headerBg: 'linear-gradient(135deg, #0F2027, #1a3a4a)', bubble: '#D1FAE5', bubbleText: '#065f46' }
    : { primary: '#3B7BF8', primaryDark: '#2563EB', headerBg: 'linear-gradient(135deg, #0F1F3D, #1A3260)', bubble: '#EBF1FF', bubbleText: '#1e3a8a' };
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
// Handles **bold** and bullet lines only — no external deps needed.
function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    // Bold
    const parts = line.split(/\*\*(.+?)\*\*/g);
    const rendered = parts.map((p, j) =>
      j % 2 === 1 ? <strong key={j}>{p}</strong> : <span key={j}>{p}</span>
    );
    // Bullet
    const isBullet = line.trimStart().startsWith('•');
    return (
      <div key={i} style={{
        paddingLeft: isBullet ? 8 : 0,
        marginBottom: i < text.split('\n').length - 1 ? 4 : 0,
        display: 'flex', gap: isBullet ? 4 : 0,
      }}>
        {isBullet && <span style={{ flexShrink: 0, marginTop: 1 }}>•</span>}
        <span>{isBullet ? rendered.map((r, j) => j === 0
          ? <span key={j}>{(r as any).props.children?.toString().replace(/^•\s*/, '')}</span>
          : r
        ) : rendered}</span>
      </div>
    );
  });
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OrdinanceChatbot({ ordinance, theme = 'encoder' }: OrdinanceChatbotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hi! I'm your AI assistant for **${ordinance.number}**. Ask me anything about this ordinance — its summary, penalties, implementing offices, deadlines, or compliance requirements.`,
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tk = getTheme(theme);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  function sendMessage(text: string) {
    if (!text.trim() || typing) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: text.trim(), ts: Date.now() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setShowSuggestions(false);
    setTyping(true);

    // Simulate network latency (600–1200ms)
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      const reply = generateResponse(text, ordinance);
      setMessages(m => [...m, { id: `a-${Date.now()}`, role: 'assistant', text: reply, ts: Date.now() }]);
      setTyping(false);
    }, delay);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Ask AI about this ordinance"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 200,
          width: 52, height: 52, borderRadius: '50%',
          background: tk.headerBg,
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget.style.transform = 'scale(1.08)'); (e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.32)'); }}
        onMouseLeave={e => { (e.currentTarget.style.transform = 'scale(1)'); (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)'); }}
      >
        {open
          ? <ChevronDown size={20} color="#fff" />
          : <MessageCircle size={22} color="#fff" />
        }
        {/* Pulse ring when closed */}
        {!open && (
          <span style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: `2px solid ${tk.primary}`,
            animation: 'chatPulse 2s ease-out infinite',
            pointerEvents: 'none',
          }} />
        )}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 92, right: 28, zIndex: 199,
          width: 380, height: 540,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'chatSlideUp 0.22s ease',
          border: '1px solid #E2E8F0',
        }}>

          {/* Header */}
          <div style={{
            background: tk.headerBg,
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
            flexShrink: 0,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: `rgba(255,255,255,0.12)`,
              border: `1px solid rgba(255,255,255,0.2)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Sparkles size={16} color={tk.primary} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                AI Ordinance Assistant
              </div>
              <div style={{
                fontSize: 10.5, color: 'rgba(255,255,255,0.5)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginTop: 1,
              }}>
                {ordinance.number} · {ordinance.title.length > 36 ? ordinance.title.slice(0, 36) + '…' : ordinance.title}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.1)', border: 'none',
                color: '#fff', width: 26, height: 26, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 12,
            background: '#F6F8FC',
          }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: 8, alignItems: 'flex-end',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'assistant' ? tk.headerBg : '#E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {msg.role === 'assistant'
                    ? <Bot size={14} color={tk.primary} />
                    : <User size={13} color="#64748B" />
                  }
                </div>
                {/* Bubble */}
                <div style={{
                  maxWidth: '78%',
                  background: msg.role === 'user' ? tk.bubble : '#fff',
                  color: msg.role === 'user' ? tk.bubbleText : '#0F1F3D',
                  borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '9px 12px',
                  fontSize: 12.5,
                  lineHeight: 1.65,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  {msg.role === 'assistant' ? renderMarkdown(msg.text) : msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: tk.headerBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Bot size={14} color={tk.primary} />
                </div>
                <div style={{
                  background: '#fff', border: '1px solid #E2E8F0',
                  borderRadius: '12px 12px 12px 2px',
                  padding: '10px 14px',
                  display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#94A3B8',
                      animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested questions (shown only at start) */}
            {showSuggestions && messages.length === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <div style={{ fontSize: 10.5, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', paddingLeft: 2 }}>
                  Suggested questions
                </div>
                {SUGGESTED.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      background: '#fff', border: '1px solid #E2E8F0',
                      borderRadius: 8, padding: '7px 11px',
                      fontSize: 12, color: '#334155', cursor: 'pointer',
                      textAlign: 'left', fontWeight: 500,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget.style.borderColor = tk.primary); (e.currentTarget.style.color = tk.primary); }}
                    onMouseLeave={e => { (e.currentTarget.style.borderColor = '#E2E8F0'); (e.currentTarget.style.color = '#334155'); }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid #E2E8F0',
            background: '#fff',
            display: 'flex', gap: 8, alignItems: 'center',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about this ordinance…"
              disabled={typing}
              style={{
                flex: 1, border: '1px solid #E2E8F0', borderRadius: 8,
                padding: '8px 12px', fontSize: 12.5, outline: 'none',
                color: '#0F1F3D', background: typing ? '#F6F8FC' : '#fff',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = tk.primary)}
              onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
              style={{
                width: 34, height: 34, borderRadius: 8, border: 'none',
                background: !input.trim() || typing ? '#E2E8F0' : tk.primary,
                color: !input.trim() || typing ? '#94A3B8' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: !input.trim() || typing ? 'default' : 'pointer',
                flexShrink: 0, transition: 'all 0.15s',
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes chatPulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(1.5); opacity: 0;   }
          100% { transform: scale(1.5); opacity: 0;   }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1;   }
        }
      `}</style>
    </>
  );
}
