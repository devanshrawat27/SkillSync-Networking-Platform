import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/components/layouts/AppLayout';
import { getProfilePhotoUrl } from '@/lib/profile-photo';

const Messages = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading]= useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
    loadConversations(session.user.id);
  };

  const loadConversations = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, created_at, content')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation
      const conversationMap = new Map();
      data?.forEach(msg => {
        const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (!conversationMap.has(otherId)) {
          conversationMap.set(otherId, msg);
        }
      });

      // Fetch user details for each conversation
      const convIds = Array.from(conversationMap.keys());
      if (convIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, profile_photo')
          .in('user_id', convIds);

        const convList = profiles?.map(p => ({
          user_id: p.user_id,
          name: p.name,
          profile_photo: p.profile_photo,
          lastMessage: conversationMap.get(p.user_id).content,
          lastMessageTime: conversationMap.get(p.user_id).created_at,
        })) || [];

        setConversations(convList);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (userId) => {
    setSelectedConversation(userId);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation,
          content: messageInput.trim(),
        });

      if (error) throw error;

      setMessageInput('');
      await handleSelectConversation(selectedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen flex bg-[var(--bg-primary)]">
      {/* Conversations List */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRightColor: 'var(--border)' }} className="w-full lg:w-80 border-r flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: 'var(--text-primary)' }} className="text-xl font-bold">Messages</h2>
            <Button variant="ghost" size="icon">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[var(--bg-primary)] border-[var(--border)]"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <MessageCircle className="w-12 h-12 text-[var(--text-muted)] mb-2 opacity-50" />
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.user_id}
                onClick={() => handleSelectConversation(conv.user_id)}
                style={{
                  backgroundColor: selectedConversation === conv.user_id ? 'var(--bg-elevated)' : 'transparent',
                }}
                className="w-full p-3 border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conv.profile_photo || undefined} />
                    <AvatarFallback>{conv.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold truncate">{conv.name}</p>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden lg:flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div style={{ backgroundColor: 'var(--bg-card)', borderBottomColor: 'var(--border)' }} className="p-4 border-b">
              {conversations.find(c => c.user_id === selectedConversation) && (
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversations.find(c => c.user_id === selectedConversation)?.profile_photo || undefined} />
                    <AvatarFallback>{conversations.find(c => c.user_id === selectedConversation)?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <p style={{ color: 'var(--text-primary)' }} className="font-semibold">{conversations.find(c => c.user_id === selectedConversation)?.name}</p>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div
                    style={{
                      backgroundColor: msg.sender_id === user.id ? 'var(--primary)' : 'var(--bg-elevated)',
                      color: msg.sender_id === user.id ? 'white' : 'var(--text-primary)',
                    }}
                    className="max-w-xs px-4 py-2 rounded-lg"
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p style={{ color: msg.sender_id === user.id ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }} className="text-xs mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ backgroundColor: 'var(--bg-card)', borderTopColor: 'var(--border)' }} className="p-4 border-t flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-[var(--bg-primary)] border-[var(--border)]"
              />
              <Button
                onClick={handleSendMessage}
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                className="hover:opacity-90"
              >
                Send
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
              <p style={{ color: 'var(--text-muted)' }} className="text-lg">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </AppLayout>
  );
};

export default Messages;
