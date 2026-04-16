import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, User, Bot, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { streamChat, ChatMessage } from '../lib/ai';
import { getReports, PredictionResults } from '../lib/mlEngine';

/** Lightweight markdown renderer for chat messages */
function renderMarkdown(text: string) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listKey = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`list-${listKey++}`} className="list-disc list-inside space-y-1 my-2">{listItems}</ul>);
      listItems = [];
    }
  };

  const inlineFormat = (str: string): React.ReactNode => {
    // Bold: **text** or __text__
    const parts = str.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
    return parts.map((part, i) => {
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      // Italic: *text* or _text_
      const italicParts = part.split(/(\*[^*]+\*|_[^_]+_)/g);
      return italicParts.map((ip, j) => {
        if ((ip.startsWith('*') && ip.endsWith('*') && !ip.startsWith('**')) ||
            (ip.startsWith('_') && ip.endsWith('_') && !ip.startsWith('__'))) {
          return <em key={`${i}-${j}`}>{ip.slice(1, -1)}</em>;
        }
        return ip;
      });
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Bullet points: - item, * item, • item
    if (/^[-*•]\s+/.test(trimmed)) {
      const content = trimmed.replace(/^[-*•]\s+/, '');
      listItems.push(<li key={`li-${idx}`}>{inlineFormat(content)}</li>);
      return;
    }

    // Numbered list: 1. item
    if (/^\d+\.\s+/.test(trimmed)) {
      flushList();
      const content = trimmed.replace(/^\d+\.\s+/, '');
      if (!listItems.length) {
        // Start ordered feel with bullet
        listItems.push(<li key={`li-${idx}`}>{inlineFormat(trimmed)}</li>);
      } else {
        listItems.push(<li key={`li-${idx}`}>{inlineFormat(content)}</li>);
      }
      return;
    }

    flushList();

    // Empty line = paragraph break
    if (!trimmed) {
      elements.push(<div key={`br-${idx}`} className="h-2" />);
      return;
    }

    // Heading: ### text
    if (trimmed.startsWith('### ')) {
      elements.push(<p key={idx} className="font-bold text-xs uppercase tracking-wider mt-3 mb-1 opacity-70">{trimmed.slice(4)}</p>);
      return;
    }

    // Default paragraph
    elements.push(<p key={idx}>{inlineFormat(trimmed)}</p>);
  });

  flushList();
  return <div className="space-y-1">{elements}</div>;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotPageProps {
  title: string;
  subtitle: string;
  examplePrompts: string[];
  placeholder: string;
}

export function ChatbotPage({ title, subtitle, examplePrompts, placeholder }: ChatbotPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Namaste! I am your PreventX ${title}. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [latestReport, setLatestReport] = useState<PredictionResults | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reports = getReports();
    if (reports.length > 0) {
      setLatestReport(reports[0]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Prepare history for AI (last 10 messages)
    const history: ChatMessage[] = messages.slice(-10).map(m => ({
      role: m.sender === 'bot' ? 'assistant' : 'user',
      content: m.text
    }));
    history.push({ role: 'user', content: text });

    // Create placeholder for bot response
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = {
      id: botMsgId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMsg]);

    try {
      let fullText = '';
      for await (const chunk of streamChat(history, latestReport)) {
        fullText += chunk;
        setMessages(prev => prev.map(m => 
          m.id === botMsgId ? { ...m, text: fullText } : m
        ));
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <header className="bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          AI Powered
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-start gap-4 max-w-2xl",
                msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                msg.sender === 'bot' ? "medical-gradient text-white" : "bg-white text-slate-600"
              )}>
                {msg.sender === 'bot' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div className={cn(
                "p-5 rounded-3xl text-sm leading-relaxed shadow-sm",
                msg.sender === 'bot' 
                  ? "bg-white text-slate-700 rounded-tl-none" 
                  : "bg-teal-600 text-white rounded-tr-none"
              )}>
                {msg.sender === 'bot' ? renderMarkdown(msg.text) : msg.text}
                <p className={cn(
                  "text-[10px] mt-2 font-bold uppercase tracking-widest opacity-50",
                  msg.sender === 'user' ? "text-right" : ""
                )}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">
            <Bot className="w-4 h-4" />
            AI is thinking...
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-6">
            {examplePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-100 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder={placeholder}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] py-5 pl-8 pr-32 focus:outline-none focus:border-teal-500 transition-colors text-slate-700 font-medium"
            />
            <div className="absolute right-3 top-3 flex items-center gap-2">
              <button className="w-12 h-12 bg-white text-slate-400 rounded-2xl flex items-center justify-center hover:text-teal-600 transition-colors shadow-sm">
                <Mic className="w-6 h-6" />
              </button>
              <button 
                onClick={() => handleSend(input)}
                className="w-12 h-12 medical-gradient text-white rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
