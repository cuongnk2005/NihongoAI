import React, { useState } from 'react';
import { api } from '../../../services/apiConfig';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';

interface KaiwaMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  correctionVi?: string;
  timestamp: string;
}

export const KaiwaPage: React.FC = () => {
  const [level, setLevel] = useState<string>('N4');
  const [messages, setMessages] = useState<KaiwaMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'こんにちは！今日はどんな一日でしたか。',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMsgText = inputMessage;
    const userMsg: KaiwaMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    const res = await api.sendKaiwaMessage(userMsgText, level);

    const aiMsg: KaiwaMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: res.aiReply,
      correctionVi: res.correctionVi,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      maxWidth: '850px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={24} color="#10b981" />
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>Luyện Hội Thoại AI Kaiwa</h2>
          </div>
          <p style={{ fontSize: '13px', color: '#999999', marginTop: '4px' }}>
            Hội thoại tương tác trực tiếp với AI trợ lý tiếng Nhật. AI sẽ tự động điều chỉnh ngữ pháp & giải thích Tiếng Việt.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#aaaaaa' }}>Cấp độ Kaiwa:</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{ padding: '6px 12px', background: '#1f1f1f', border: '1px solid #3b3c40', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
          >
            <option value="N5">N5 (Cơ bản)</option>
            <option value="N4">N4 (Sơ cấp)</option>
          </select>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div style={{
        flex: 1,
        background: '#1f1f1f',
        borderRadius: '12px',
        border: '1px solid #333333',
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {/* Sender Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '11px', color: '#888888' }}>
              {msg.sender === 'ai' ? (
                <>
                  <Bot size={14} color="#10b981" />
                  <span style={{ color: '#10b981', fontWeight: '600' }}>AI Sensei</span>
                </>
              ) : (
                <>
                  <User size={14} color="#0099ff" />
                  <span style={{ color: '#0099ff', fontWeight: '600' }}>Bạn</span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            {/* Message Bubble */}
            <div style={{
              background: msg.sender === 'user' ? '#0099ff' : '#28292d',
              color: '#ffffff',
              padding: '12px 16px',
              borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
              fontSize: '15px',
              lineHeight: '1.5',
              fontFamily: "'Noto Sans JP', sans-serif",
              border: msg.sender === 'ai' ? '1px solid #38393e' : 'none'
            }}>
              {msg.text}
            </div>

            {/* AI Correction Note (If applicable) */}
            {msg.correctionVi && (
              <div style={{
                marginTop: '6px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderLeft: '3px solid #10b981',
                padding: '8px 12px',
                borderRadius: '0 8px 8px 0',
                fontSize: '12px',
                color: '#cccccc',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start'
              }}>
                <Sparkles size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>Góp ý từ AI: </span>
                  {msg.correctionVi}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px' }}>
            <Bot size={16} className="animate-spin" />
            <span>AI đang suy nghĩ phản hồi...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Nhập câu trả lời bằng tiếng Nhật (Ví dụ: 今日は映画を見に行きました)..."
          style={{
            flex: 1,
            padding: '12px 16px',
            background: '#1f1f1f',
            border: '1px solid #3b3c40',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '15px',
            fontFamily: "'Noto Sans JP', sans-serif"
          }}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="anki-btn"
          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0 22px' }}
        >
          <Send size={16} />
          Gửi
        </button>
      </form>
    </div>
  );
};
