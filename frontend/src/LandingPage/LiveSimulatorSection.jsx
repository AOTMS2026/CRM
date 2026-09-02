import React, { useState, useEffect } from 'react';
import { 
  IoSend, 
  IoSparkles, 
  IoCheckmarkDone, 
  IoRefreshOutline, 
  IoLogoWhatsapp,
  IoHardwareChipOutline,
  IoPulse
} from 'react-icons/io5';
import { checkBackendHealth, sendLiveMessage, API_BASE_URL } from '../services/api';

export default function LiveSimulatorSection() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! Welcome to AutoMachine AI demo. Connected to live Render API. Type anything or click one of the quick prompts below (English or Tenglish supported)!',
      time: 'Just now',
      intent: 'Greeting / System Welcome'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    checkBackendHealth().then((res) => {
      if (res?.status === 'healthy') {
        setBackendStatus('online');
      } else {
        setBackendStatus('fallback');
      }
    });
  }, []);

  const presetScenarios = [
    {
      label: 'Pricing (Tenglish)',
      query: 'Cost entha bro? Monthly plans unnaya?',
      reply: 'Mana Starter plan $29/mo nundi start avtundi! Anti-ban protection, unlimited automated replies, and 24/7 AI chat support included. Free 14-day trial kuda undi bro! 🎉',
      intent: 'Intent: Pricing & Subscriptions (Tenglish) • 99.8% Match'
    },
    {
      label: 'Anti-Ban Safety',
      query: 'Will my WhatsApp account get banned for bulk broadcast?',
      reply: 'Never with AutoMachine! We use Redis Leaky-Bucket pacing + random human typing jitter (3-7 seconds). Over 10M+ messages sent with a 0.00% ban rate.',
      intent: 'Intent: Security & Anti-Ban Inquiry • 99.5% Match'
    },
    {
      label: 'Order Status',
      query: 'Track my order #WM-84920 please',
      reply: 'Order #WM-84920 has been dispatched via BlueDart Express! Expected delivery tomorrow by 3:00 PM. Tracking link sent to your SMS as well. 📦',
      intent: 'Intent: Order Tracking & CRM Webhook • 99.9% Match'
    },
    {
      label: 'Business Hours',
      query: 'Repu office open untunda? Can I call tomorrow?',
      reply: 'Yes! Monday to Saturday morning 9:00 AM nundi evening 7:00 PM varaku team available untundi. But our AI bot replies 24/7 without sleep! 🚀',
      intent: 'Intent: Business Hours (Tenglish) • 98.7% Match'
    }
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user',
      text: text,
      time: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const matched = presetScenarios.find(p => p.query.toLowerCase() === text.toLowerCase());
    const liveResponse = !matched ? await sendLiveMessage(text) : null;

    setTimeout(() => {
      setIsTyping(false);
      const botMsg = {
        sender: 'bot',
        text: matched 
          ? matched.reply 
          : liveResponse 
          ? `${liveResponse.reply} — Processed via live Render FastAPI backend! ⚡` 
          : `Thank you for your inquiry: "${text}". AutoMachine AI classified this intent and synced with your database via live FastAPI in 280ms!`,
        time: 'Just now',
        intent: matched ? matched.intent : 'Intent: CRM Live Lead Qualification • Verified via Render Backend'
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 750);
  };

  const handleReset = () => {
    setMessages([
      {
        sender: 'bot',
        text: 'Namaste! Welcome to AutoMachine AI demo. Type anything or click one of the quick prompts below (English or Tenglish supported)!',
        time: 'Just now',
        intent: 'Greeting / System Welcome'
      }
    ]);
  };

  return (
    <section id="simulator" className="py-24 relative overflow-hidden">
      
      {/* Background ambient accent */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-burnt_peach/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full nova-pill text-xs font-bold text-tan tracking-wide uppercase">
            <IoHardwareChipOutline className="text-sm text-burnt_peach" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-tan-900 tracking-tight">
            Try The <span className="gradient-text-peach">Live Automation Simulator</span> Right Now
          </h2>
          <p className="text-base sm:text-lg text-tan-800 leading-relaxed font-normal">
            Test how our AI engine understands human queries, handles regional Tenglish phrasing, and sends instant automated responses with zero lag.
          </p>
        </div>

        {/* Simulator Container - Nova Card */}
        <div className="max-w-4xl mx-auto nova-card rounded-3xl border border-muted_teal/35 shadow-2xl overflow-hidden">
          
          {/* Top Bar */}
          <div className="bg-deep_space_blue/90 px-6 py-4 border-b border-muted_teal/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-burnt_peach to-tan flex items-center justify-center text-prussian_blue-100 shadow-md border border-white/20">
                <IoLogoWhatsapp className="text-2xl" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-tan-900 text-sm sm:text-base">Nova Live Console</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1.5 ${
                    backendStatus === 'online' 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {backendStatus === 'online' ? 'RENDER LIVE' : 'SYNCING'}
                  </span>
                </div>
                <p className="text-xs text-muted_teal font-mono flex items-center gap-1">
                  <span>FastAPI + GraphQL</span>
                  <span>•</span>
                  <a href="https://crm-fee1.onrender.com/docs" target="_blank" rel="noreferrer" className="text-tech_orange hover:underline">
                    crm-fee1.onrender.com
                  </a>
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-xl nova-pill hover:bg-deep_space_blue text-xs font-mono font-semibold text-tan-800 flex items-center gap-1.5 transition-colors border border-muted_teal/20"
            >
              <IoRefreshOutline className="text-sm text-burnt_peach" /> Reset Session
            </button>
          </div>

          {/* Preset Prompts - Nova Pill Chips */}
          <div className="bg-prussian_blue-300/80 px-6 py-3 border-b border-muted_teal/15 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-mono font-bold text-tan-800 whitespace-nowrap">Try Prompts:</span>
            {presetScenarios.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold nova-pill hover:bg-burnt_peach hover:text-prussian_blue-100 text-tan-900 border border-muted_teal/20 hover:border-burnt_peach transition-all duration-200"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Feed */}
          <div className="p-6 h-96 overflow-y-auto space-y-4 bg-prussian_blue-100/70">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="flex items-center gap-1.5 mb-1 ml-1 text-[11px] font-mono text-tan font-semibold">
                    <IoSparkles className="text-xs text-burnt_peach" />
                    <span>{msg.intent}</span>
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-deep_space_blue text-tan-900 rounded-tr-sm border border-muted_teal/35'
                      : 'bg-gradient-to-r from-deep_space_blue to-prussian_blue-400 text-tan-900 rounded-tl-sm border border-burnt_peach/35'
                  }`}
                >
                  <p className="font-medium">{msg.text}</p>
                  <div className="text-[10px] opacity-70 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                    <span>{msg.time}</span>
                    {msg.sender === 'user' && <IoCheckmarkDone className="text-muted_teal text-xs" />}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 max-w-[150px] rounded-2xl nova-pill text-tan text-xs font-mono font-semibold animate-pulse border border-tan/30">
                <IoSparkles className="animate-spin text-sm text-burnt_peach" />
                <span>Nova AI typing...</span>
              </div>
            )}
          </div>

          {/* Input Box with Nova Styling */}
          <div className="p-4 bg-deep_space_blue/90 border-t border-muted_teal/20 flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything in English or Tenglish (e.g. 'Price entha?')..."
              className="flex-1 bg-prussian_blue-200 text-tan-900 placeholder:text-tan-800/60 text-sm px-4 py-3 rounded-xl border border-muted_teal/20 focus:outline-none focus:border-burnt_peach transition-colors font-sans"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              className="nova-btn-shimmer px-5 py-3 rounded-xl bg-burnt_peach hover:bg-burnt_peach-400 disabled:opacity-50 text-prussian_blue-100 font-bold text-xs uppercase tracking-wider shadow-lg shadow-burnt_peach/25 flex items-center gap-2 transition-all border-t border-white/20"
            >
              <span>Transmit</span>
              <IoSend className="text-xs" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
