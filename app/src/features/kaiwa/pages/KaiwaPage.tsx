import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useKaiwaChat } from '../hooks/useKaiwaChat';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Send, Bot, User, Sparkles, Volume2, Eye, EyeOff, Headphones, RotateCcw, Mic, MicOff } from 'lucide-react';
import { useTextLookup } from '../../../hooks/useTextLookup';
import { KanjiLookupPopover } from '../../../components/KanjiLookupPopover';

export const KaiwaPage: React.FC = () => {
  const {
    level,
    setLevel,
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    sendMessage,
    resetConversation,
    playSpeech,
  } = useKaiwaChat('N4');

  // Track which AI messages have been revealed (default is hidden for listening practice)
  const [revealedMessages, setRevealedMessages] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick Kanji & Sino-Vietnamese text lookup popover
  const { lookupResult, position, closeLookup, handleMouseUp } = useTextLookup();

  // Speech Recognition hook for live voice input (Speech-to-Text)
  const handleTranscriptChange = useCallback((text: string) => {
    if (text) {
      setInputMessage(text);
    }
  }, [setInputMessage]);

  const {
    isListening,
    error: micError,
    isSupported: isMicSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: 'ja-JP',
    onTranscriptChange: handleTranscriptChange,
  });

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleReveal = (id: string) => {
    setRevealedMessages((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      stopListening();
    }
    await sendMessage(e);
  };

  // Keyboard shortcut: Ctrl+M to toggle mic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, toggleListening]);

  return (
    <div
      onMouseUp={handleMouseUp}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 140px)',
        maxWidth: '880px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-grotesk)',
                fontSize: '1.6rem',
                fontWeight: 700,
                marginBottom: '2px',
              }}
            >
              💬 Hội Thoại Tình Huống (AI Kaiwa)
            </h2>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#ECFDF5',
                color: 'var(--accent-pine)',
                border: '1px solid var(--accent-pine)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
              title="Chế độ nghe trước: Câu nói của AI được ẩn chữ để luyện phản xạ nghe hiểu"
            >
              <Headphones size={13} />
              Luyện nghe trước
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#EFF6FF',
                color: 'var(--accent-cobalt)',
                border: '1px solid var(--accent-cobalt)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
              title="Hỗ trợ nói trực tiếp qua micro, tự động điền chữ tiếng Nhật"
            >
              <Mic size={13} />
              Nói qua Micro
            </span>
          </div>
          <p style={{ color: 'var(--ink-secondary)', fontSize: '0.88rem' }}>
            Nghe AI Sensei phát âm trước (bấm 👁️ để xem chữ). Bấm nút 🎙️ để nói tiếng Nhật trực tiếp, sau đó nhấn <strong>Enter</strong> để gửi.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn-tactile sm"
            onClick={resetConversation}
            title="Làm mới cuộc trò chuyện"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
          >
            <RotateCcw size={14} />
            <span>Làm mới</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-secondary)' }}>Trình độ:</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="form-select"
              style={{ width: '110px', padding: '6px 10px' }}
            >
              <option value="N5">N5 (Cơ bản)</option>
              <option value="N4">N4 (Sơ cấp)</option>
              <option value="N3">N3 (Trung cấp)</option>
            </select>
          </div>
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
          gap: '18px',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          background: 'var(--bg-card)',
        }}
      >
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          const isRevealed = !!revealedMessages[msg.id];

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: !isAi ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                alignSelf: !isAi ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Sender Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--ink-secondary)',
                }}
              >
                {isAi ? (
                  <>
                    <Bot size={15} color="var(--accent-pine)" />
                    <span style={{ color: 'var(--accent-pine)' }}>AI Sensei</span>
                  </>
                ) : (
                  <>
                    <User size={15} color="var(--accent-cobalt)" />
                    <span style={{ color: 'var(--accent-cobalt)' }}>Bạn</span>
                  </>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  background: !isAi ? 'var(--accent-cobalt)' : 'var(--bg-surface)',
                  color: !isAi ? '#FFFFFF' : 'var(--ink-primary)',
                  padding: isAi && !isRevealed ? '10px 14px' : '14px 18px',
                  borderRadius: 'var(--radius-btn)',
                  border: 'var(--border-dark)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  minWidth: isAi ? '260px' : 'auto',
                  transition: 'all 0.2s ease',
                }}
              >
                {!isAi ? (
                  // User Message
                  <span
                    style={{
                      fontSize: '1.15rem',
                      lineHeight: '1.5',
                      fontFamily: 'var(--font-kanji)',
                      fontWeight: 600,
                    }}
                  >
                    {msg.text}
                  </span>
                ) : !isRevealed ? (
                  // AI Message (Listening Mode - Masked)
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      gap: '12px',
                    }}
                  >
                    <button
                      type="button"
                      className="btn-tactile sm"
                      onClick={() => playSpeech(msg.text)}
                      title="Bấm để nghe AI Sensei nói"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#ECFDF5',
                        borderColor: 'var(--accent-pine)',
                        color: 'var(--accent-pine)',
                        fontWeight: 700,
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontSize: '0.95rem',
                      }}
                    >
                      <Volume2 size={18} />
                      <span>Nghe phát âm</span>
                    </button>

                    <button
                      type="button"
                      className="btn-tactile sm"
                      onClick={() => toggleReveal(msg.id)}
                      title="Nếu không hiểu, bấm vào con mắt để hiển thị rõ ràng câu nói"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '38px',
                        height: '38px',
                        padding: 0,
                        background: '#FEF08A',
                        borderColor: 'var(--border-dark)',
                        color: '#0F172A',
                        borderRadius: '6px',
                        flexShrink: 0,
                      }}
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                ) : (
                  // AI Message (Revealed Mode)
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      width: '100%',
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: '1.2rem',
                        lineHeight: '1.6',
                        fontFamily: 'var(--font-kanji)',
                        fontWeight: 600,
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.text}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        className="btn-tactile sm"
                        onClick={() => playSpeech(msg.text)}
                        title="Nghe lại phát âm"
                        style={{
                          padding: '6px 8px',
                          background: '#F1F5F9',
                          border: 'var(--border-dark)',
                          borderRadius: '6px',
                        }}
                      >
                        <Volume2 size={16} color="var(--accent-pine)" />
                      </button>

                      <button
                        type="button"
                        className="btn-tactile sm"
                        onClick={() => toggleReveal(msg.id)}
                        title="Ẩn câu nói để luyện nghe lại"
                        style={{
                          padding: '6px 8px',
                          background: '#FEF08A',
                          border: 'var(--border-dark)',
                          borderRadius: '6px',
                        }}
                      >
                        <EyeOff size={16} color="#0F172A" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Correction Note (Shown when revealed or if present) */}
              {isAi && msg.correctionVi && isRevealed && (
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
                    alignItems: 'flex-start',
                    maxWidth: '100%',
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
          );
        })}

        {isLoading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--accent-pine)',
              fontSize: '0.95rem',
              fontWeight: 700,
              padding: '8px 12px',
              background: '#ECFDF5',
              border: '1px dashed var(--accent-pine)',
              borderRadius: '8px',
              width: 'fit-content',
            }}
          >
            <Bot size={20} className="animate-spin" />
            <span>AI Sensei đang soạn câu trả lời...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Listening Status Banner */}
      {isListening && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            background: '#FEF2F2',
            border: '2px solid #EF4444',
            borderRadius: '8px',
            padding: '8px 14px',
            marginTop: '12px',
            fontSize: '0.9rem',
            color: '#991B1B',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#EF4444',
                boxShadow: '0 0 8px #EF4444',
                animation: 'pulse 1.2s infinite',
              }}
            />
            <span>
              <strong>Microphone đang mở:</strong> Hãy nói câu tiếng Nhật của bạn. Chữ sẽ tự động điền vào ô bên dưới. Nhấn <strong>Enter</strong> để gửi.
            </span>
          </div>
          <button
            type="button"
            onClick={stopListening}
            style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: '4px',
              color: '#991B1B',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '2px 8px',
              cursor: 'pointer',
            }}
          >
            Dừng nói
          </button>
        </div>
      )}

      {/* Microphone Error Notification */}
      {micError && (
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: '8px',
            padding: '8px 14px',
            marginTop: '12px',
            fontSize: '0.85rem',
            color: '#92400E',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>⚠️ {micError}</span>
        </div>
      )}

      {/* Input Form with Voice Button */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', marginTop: isListening || micError ? '10px' : '16px' }}>
        {/* Microphone Toggle Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`btn-tactile lg`}
          title={
            !isMicSupported
              ? 'Trình duyệt chưa hỗ trợ Web Speech API'
              : isListening
              ? 'Đang nghe tiếng Nhật... Bấm để tắt micro'
              : 'Bấm để nói bằng Micro (Phím tắt: Ctrl + M)'
          }
          style={{
            padding: '0 16px',
            background: isListening ? '#FEE2E2' : '#FEF08A',
            borderColor: isListening ? '#EF4444' : 'var(--border-dark)',
            color: isListening ? '#B91C1C' : '#0F172A',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          {isListening ? (
            <>
              <MicOff size={20} color="#DC2626" />
              <span>Dừng</span>
            </>
          ) : (
            <>
              <Mic size={20} color="#0F172A" />
              <span>Nói</span>
            </>
          )}
        </button>

        {/* Japanese Answer Input Field */}
        <input
          ref={inputRef}
          type="text"
          className="japanese-answer-input"
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '1.15rem',
            borderColor: isListening ? '#EF4444' : undefined,
            backgroundColor: isListening ? '#FFFDF5' : undefined,
          }}
          placeholder={
            isListening
              ? '🎙️ Đang lắng nghe... Hãy nói tiếng Nhật (Nhấn Enter để gửi)'
              : 'Nhập hoặc nói câu tiếng Nhật (Ví dụ: 今日は天気がいいですね)...'
          }
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isLoading}
          autoFocus
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="btn-tactile primary lg"
          style={{ padding: '0 24px', flexShrink: 0 }}
          title="Gửi câu thoại (Phím tắt: Enter)"
        >
          <Send size={18} />
          <span>Gửi</span>
        </button>
      </form>

      {/* Kanji & Sino-Vietnamese Popover on selection */}
      {lookupResult && (
        <KanjiLookupPopover result={lookupResult} position={position} onClose={closeLookup} />
      )}
    </div>
  );
};
