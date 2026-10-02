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
            <MessageSquare size={24} color="var(--anki-green)" />
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--anki-text)' }}>Luyện Hội Thoại AI Kaiwa</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--anki-text-muted)', marginTop: '4px' }}>
            Hội thoại tương tác trực tiếp với AI trợ lý tiếng Nhật. AI sẽ tự động điều chỉnh ngữ pháp & giải thích Tiếng Việt.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--anki-text-muted)' }}>Cấp độ Kaiwa:</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}
          >
            <option value="N5">N5 (Cơ bản)</option>
            <option value="N4">N4 (Sơ cấp)</option>
          </select>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div style={{
        flex: 1,
        background: 'var(--anki-panel-bg)',
        borderRadius: '12px',
        border: '1px solid var(--anki-border)',
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: 'var(--anki-shadow)'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '11px', color: 'var(--anki-text-muted)' }}>
              {msg.sender === 'ai' ? (
                <>
                  <Bot size={14} color="var(--anki-green)" />
                  <span style={{ color: 'var(--anki-green)', fontWeight: '600' }}>AI Sensei</span>
                </>
              ) : (
                <>
                  <User size={14} color="var(--anki-blue)" />
                  <span style={{ color: 'var(--anki-blue)', fontWeight: '600' }}>Bạn</span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            {/* Message Bubble */}
            <div style={{
              background: msg.sender === 'user' ? 'var(--anki-blue)' : 'var(--anki-card-sub)',
              color: msg.sender === 'user' ? '#ffffff' : 'var(--anki-text)',
              padding: '12px 16px',
              borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
              fontSize: '15px',
              lineHeight: '1.5',
              fontFamily: "'Noto Sans JP', sans-serif",
              border: msg.sender === 'ai' ? '1px solid var(--anki-border)' : 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              {msg.text}
            </div>

            {/* AI Correction Note (If applicable) */}
            {msg.correctionVi && (
              <div style={{
                marginTop: '6px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderLeft: '3px solid var(--anki-green)',
                padding: '8px 12px',
                borderRadius: '0 8px 8px 0',
                fontSize: '12px',
                color: 'var(--anki-text)',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start'
              }}>
                <Sparkles size={14} color="var(--anki-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ color: 'var(--anki-green)', fontWeight: '600' }}>Góp ý từ AI: </span>
                  {msg.correctionVi}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--anki-green)', fontSize: '13px' }}>
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
            borderRadius: '10px',
            fontSize: '15px',
            fontFamily: "'Noto Sans JP', sans-serif"
          }}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="anki-btn"
          style={{ background: 'var(--anki-green)', color: '#fff', border: 'none', padding: '0 22px' }}
        >
          <Send size={16} />
          Gửi
        </button>
      </form>
    </div>
  );
};
