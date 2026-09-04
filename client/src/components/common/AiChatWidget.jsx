import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hey there! 👋 I am **ShopSphere AI**. I can help you find the perfect bag, compare products, check budgets, or recommend gifts. Just ask me anything!',
      products: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages]);

  const handleSend = async (messageText) => {
    const textToSend = typeof messageText === 'string' ? messageText : input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-6).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text
      }));

      const res = await api.post('/ai/chat', {
        message: textToSend,
        history: conversationHistory
      });

      const botMessage = {
        role: 'assistant',
        text: res.data.reply || "I'm having trouble processing that right now.",
        products: res.data.products || []
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I couldn't reach the server right now. Please check your connection and try again! 🔌",
          products: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format bot markdown text
  const formatText = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*|\n)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-brand-600 font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part === '\n') {
        return <br key={index} />;
      }
      return part;
    });
  };

  const quickPrompts = [
    '🎒 Backpacks under ₹2,000',
    '💼 Best Office Bags',
    '🎁 Gift Recommendations',
    '⭐ Top Rated Products'
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-2xl shadow-brand-500/40 hover:scale-105 transition-all duration-300 z-50 cursor-pointer"
          title="ShopSphere AI Assistant"
        >
          <span className="ai-pulse"></span>
          <i className="ri-sparkling-2-fill text-2xl"></i>
        </button>
      )}

      {/* Chat Popup Modal */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-[calc(100vw-40px)] sm:w-[390px] h-[540px] max-h-[82vh] rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/60 shadow-2xl flex flex-col overflow-hidden z-50 animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-500 via-amber-500 to-brand-700 p-4 sm:p-5 flex items-center justify-between text-white flex-shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <i className="ri-sparkling-2-fill text-lg"></i>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight leading-tight">ShopSphere AI</h3>
                <p className="text-[11px] text-white/80 font-medium">Your personal shopping assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-dark-900 text-white rounded-br-xs'
                      : 'bg-white text-dark-900 border border-gray-100 shadow-sm rounded-bl-xs'
                  }`}
                >
                  {formatText(msg.text)}
                </div>

                {/* Attached Product Cards if present */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full mt-2.5 space-y-2">
                    {msg.products.slice(0, 3).map((p) => {
                      const finalPrice = Number(p.price) - Number(p.discount || 0);
                      return (
                        <Link
                          key={p._id}
                          to={`/product/${p._id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex flex-col gap-1 p-3 rounded-xl bg-white border border-gray-200/80 hover:border-brand-500 shadow-xs hover:shadow-md transition-all text-dark-900 group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-dark-900 truncate group-hover:text-brand-600">
                              {p.name}
                            </span>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-brand-50 text-brand-600">
                              {p.category}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-emerald-600">₹{finalPrice.toLocaleString('en-IN')}</span>
                              {p.discount > 0 && (
                                <span className="text-[10px] text-gray-400 line-through">₹{Number(p.price).toLocaleString('en-IN')}</span>
                              )}
                            </div>
                            {p.avgRating > 0 && (
                              <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-0.5">
                                <i className="ri-star-fill text-[10px]"></i> {p.avgRating}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-xs w-20">
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.15s]"></div>
                <div className="w-2 h-2 rounded-full bg-brand-600 animate-bounce [animation-delay:0.3s]"></div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white/80 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="text-[11px] font-medium whitespace-nowrap px-3 py-1 rounded-full bg-gray-100 hover:bg-brand-50 hover:text-brand-600 transition-colors text-dark-500 cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about bags, budgets, gifts..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-dark-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
            >
              <i className="ri-send-plane-2-fill text-base"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
