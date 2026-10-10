import React, { useState } from 'react';
import { api } from '../../../services/apiConfig';
import { Send, Bot, User, Sparkles, Volume2 } from 'lucide-react';

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

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 140px)',
      maxWidth: '880px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>
            💬 Hội Thoại Tình Huống (AI Kaiwa)
          </h2>
          <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
            Luyện tập giao tiếp tiếng Nhật tương tác hai chiều, AI tự động gợi ý diễn đạt tự nhiên hơn.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>Trình độ:</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="form-select"
            style={{ width: '110px', padding: '6px 12px' }}
          >
            <option value="N5">N5 (Cơ bản)</option>
            <option value="N4">N4 (Sơ cấp)</option>
            <option value="N3">N3 (Trung cấp)</option>
          </select>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div 
        className="card-tactile"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '24px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>
              {msg.sender === 'ai' ? (
                <>
                  <Bot size={14} color="var(--accent-pine)" />
                  <span style={{ color: 'var(--accent-pine)' }}>AI Sensei</span>
                </>
              ) : (
                <>
                  <User size={14} color="var(--accent-cobalt)" />
                  <span style={{ color: 'var(--accent-cobalt)' }}>Bạn</span>
                </>
              )}
              <span>• {msg.timestamp}</span>
            </div>

            {/* Message Bubble */}
            <div 
              style={{
                background: msg.sender === 'user' ? 'var(--accent-cobalt)' : 'var(--bg-surface)',
                color: msg.sender === 'user' ? '#FFFFFF' : 'var(--ink-primary)',
                padding: '12px 18px',
                borderRadius: 'var(--radius-btn)',
                fontSize: '1.15rem',
                lineHeight: '1.5',
                fontFamily: 'var(--font-kanji)',
                fontWeight: 600,
                border: 'var(--border-dark)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>{msg.text}</span>
              {msg.sender === 'ai' && (
                <button
                  className="btn-tactile sm"
                  style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '2px 4px' }}
                  onClick={() => playSpeech(msg.text)}
                  title="Nghe phát âm"
                >
                  <Volume2 size={16} color="var(--accent-pine)" />
                </button>
              )}
            </div>

            {/* AI Correction Note */}
            {msg.correctionVi && (
              <div 
                style={{
                  marginTop: '8px',
                  background: '#FFE8D6',
                  border: 'var(--border-dark)',
                  boxShadow: '1px 1px 0px var(--border-color)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-btn)',
                  fontSize: '0.85rem',
                  color: '#0F172A',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start'
                }}
              >
                <Sparkles size={16} color="var(--accent-vermilion)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--accent-vermilion)' }}>Gợi ý diễn đạt tự nhiên: </strong>
                  {msg.correctionVi}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-pine)', fontSize: '0.9rem', fontWeight: 700 }}>
            <Bot size={18} className="animate-spin" />
            <span>AI Sensei đang soạn câu trả lời...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <input
          type="text"
          className="japanese-answer-input"
          style={{ padding: '12px 16px', fontSize: '1.15rem' }}
          placeholder="Nhập câu tiếng Nhật để trò chuyện (Ví dụ: 今日は天気がいいですね)..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isLoading}
          autoFocus
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="btn-tactile primary lg"
          style={{ padding: '0 24px' }}
        >
          <Send size={18} />
          <span>Gửi</span>
        </button>
      </form>
    </div>
  );
};
