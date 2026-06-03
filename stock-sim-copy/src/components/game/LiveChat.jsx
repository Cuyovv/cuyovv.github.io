import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTheme } from '@/lib/themes';

const THEME_COLORS = {
  emerald: '#22c55e', cyan: '#06b6d4', violet: '#8b5cf6',
  amber: '#f59e0b', rose: '#f43f5e', indigo: '#6366f1',
  orange: '#f97316', teal: '#14b8a6',
};

export default function LiveChat({ portfolio }) {
  const [message, setMessage] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('chat');

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 50),
    refetchInterval: 3000,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['activity-events'],
    queryFn: () => base44.entities.ActivityEvent.list('-created_date', 30),
    refetchInterval: 5000,
  });

  // Newest at bottom
  const sorted = [...messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  const sortedEvents = [...events].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  useEffect(() => {
    if (!collapsed) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sorted.length, collapsed]);

  const sendMessage = async () => {
    const text = message.trim();
    if (!text || sending) return;
    setSending(true);
    setMessage('');
    await base44.entities.ChatMessage.create({
      player_name: portfolio?.player_name || 'Anonymous',
      message: text,
      theme: portfolio?.theme || 'emerald',
    });
    queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const themeColor = THEME_COLORS[portfolio?.theme] || '#22c55e';

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 flex flex-col" style={{ maxHeight: collapsed ? 48 : 400 }}>
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center justify-between px-3 py-2.5 rounded-t-xl border text-sm font-semibold w-full"
        style={{ background: 'hsl(var(--card))', borderColor: themeColor + '55', color: themeColor }}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span>Social</span>
          <span className="text-[10px] font-normal text-muted-foreground">({sorted.length})</span>
        </div>
        {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col border border-t-0 rounded-b-xl overflow-hidden"
            style={{ background: 'hsl(var(--card))', borderColor: themeColor + '33' }}
          >
            {/* Tab switcher */}
            <div className="flex border-b" style={{ borderColor: themeColor + '22' }}>
              {['chat', 'activity'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-1.5 text-[11px] font-semibold capitalize transition-colors"
                  style={activeTab === tab ? { color: themeColor, borderBottom: `2px solid ${themeColor}` } : { color: 'hsl(var(--muted-foreground))' }}
                >
                  {tab === 'activity' ? '⚡ Activity' : '💬 Chat'}
                </button>
              ))}
            </div>

            {activeTab === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5" style={{ maxHeight: 260 }}>
                  {sorted.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No messages yet. Say hi!</p>
                  )}
                  {sorted.map(msg => {
                    const color = THEME_COLORS[msg.theme] || '#22c55e';
                    return (
                      <div key={msg.id} className="text-xs">
                        <span className="font-semibold mr-1" style={{ color }}>{msg.player_name}</span>
                        <span className="text-foreground/80">{msg.message}</span>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <div className="flex gap-1.5 p-2 border-t" style={{ borderColor: themeColor + '22' }}>
                  <Input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Type a message..."
                    className="h-7 text-xs flex-1"
                    maxLength={120}
                  />
                  <Button
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    style={{ background: themeColor }}
                    onClick={sendMessage}
                    disabled={!message.trim() || sending}
                  >
                    <Send className="w-3 h-3 text-white" />
                  </Button>
                </div>
              </>
            )}

            {activeTab === 'activity' && (
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5" style={{ maxHeight: 300 }}>
                {sortedEvents.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No activity yet. Start trading!</p>
                )}
                {sortedEvents.map(ev => {
                  const color = THEME_COLORS[ev.theme] || '#f59e0b';
                  const icons = { prestige: '🏆', big_trade: '💸', achievement: '🎯', milestone: '📈' };
                  return (
                    <div key={ev.id} className="text-xs rounded-lg px-2 py-1.5 bg-muted/50">
                      <span className="mr-1">{icons[ev.event_type] || '⚡'}</span>
                      <span className="font-semibold mr-1" style={{ color }}>{ev.player_name}</span>
                      <span className="text-foreground/70">{ev.message}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}