import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

const SUGGESTIONS = [
  { emoji: '➕', label: 'Help me with math' },
  { emoji: '🦁', label: 'Tell me about animals' },
  { emoji: '🪐', label: 'Fun space facts' },
  { emoji: '📖', label: 'Help me read better' },
];

type AIAssistantProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function AIAssistant({ open, onOpenChange }: AIAssistantProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) onOpenChange?.(value);
    else setInternalOpen(value);
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: "Hi there! I'm Owly, your learning buddy! Ask me anything about your lessons, homework, or just something you're curious about!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 300);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: 'Please sign in again before using Owly.' },
        ]);
        return;
      }

      const newMessages: ChatMessage[] = [...messages, { role: 'user', text: trimmed }];
      setMessages(newMessages);
      setInput('');
      setLoading(true);

      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            messages: newMessages.map((message) => ({ role: message.role, text: message.text })),
          }),
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(typeof data?.error === 'string' ? data.error : `Request failed (${response.status})`);
        }

        if (typeof data?.reply !== 'string') {
          throw new Error('Unexpected response');
        }

        setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: "Oops! I had trouble answering that. Please try again in a moment!",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[200] flex items-center gap-2 pl-2 pr-3 md:pr-4 py-2 rounded-2xl bg-gradient-to-br from-sky-300 to-lavender-400 shadow-soft-lg text-white"
            aria-label="Open Owly AI assistant"
          >
            <motion.div
              className="absolute inset-0 rounded-2xl bg-lavender-400"
              animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="relative w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white/25 flex items-center justify-center shrink-0"
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <span className="text-2xl md:text-3xl">🦉</span>
            </motion.div>
            <span className="relative font-display font-bold text-sm md:text-base whitespace-nowrap">Ask Owly</span>
            <motion.div
              className="relative w-3.5 h-3.5 rounded-full bg-mint-400 border-2 border-white shrink-0"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-[200] w-[calc(100vw-2rem)] sm:w-96 h-[min(70vh,560px)] glass-strong rounded-3xl shadow-soft-lg flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-sky-300 to-lavender-400 text-white">
              <div className="w-10 h-10 rounded-2xl bg-white/25 flex items-center justify-center text-xl shrink-0">🦉</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-base leading-tight flex items-center gap-1.5">
                  Owly
                  <Sparkles size={14} className="text-lemon-200" />
                </h3>
                <p className="text-xs text-white/80 leading-tight">Your AI learning buddy</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-white/20 transition-colors shrink-0"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.map((message, index) => (
                <motion.div
                  key={`${message.role}-${index}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed font-medium ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-sky-300 to-lavender-400 text-white rounded-br-md'
                        : 'bg-lavender-50 text-lavender-600 rounded-bl-md border border-lavender-100'
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-lavender-50 border border-lavender-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          className="w-2 h-2 rounded-full bg-lavender-300"
                          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.15, ease: 'easeInOut' }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {messages.length === 1 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      onClick={() => void sendMessage(suggestion.label)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-lavender-100 text-xs font-display font-semibold text-lavender-500 hover:border-lavender-300 hover:bg-lavender-50 transition-colors"
                    >
                      <span className="text-sm">{suggestion.emoji}</span>
                      {suggestion.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="px-3 py-3 border-t border-lavender-100 bg-white/60">
              <div className="flex items-center gap-2 bg-white rounded-2xl border border-lavender-200 px-3 py-1.5 focus-within:border-lavender-400 transition-colors">
                <MessageCircle size={18} className="text-lavender-300 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask Owly anything..."
                  disabled={loading}
                  maxLength={300}
                  className="flex-1 bg-transparent outline-none text-sm text-lavender-600 font-medium placeholder:text-lavender-300 disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || loading}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-300 to-lavender-400 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
