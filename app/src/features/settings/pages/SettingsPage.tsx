import React, { useState } from 'react';
import { Key, Cpu, ShieldCheck, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [provider, setProvider] = useState<string>('gemini');
  const [apiKey, setApiKey] = useState<string>('AIzaSyD-MOCK_KEY_EXAMPLE');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [model, setModel] = useState<string>('gemini-1.5-flash');
  const [learnerLevel, setLearnerLevel] = useState<string>('N4');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ width: '100%', maxWidth: '780px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>
          ⚙️ Cấu Hình AI Provider & Hệ Thống
        </h2>
        <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
          Cấu hình API Key cho các nhà cung cấp AI (Google Gemini, OpenAI, DeepSeek) phục vụ luyện dịch câu và Kaiwa.
        </p>
      </div>

      {savedSuccess && (
        <div 
          style={{
            background: '#D8F3DC',
            border: 'var(--border-dark)',
            boxShadow: 'var(--shadow-sm)',
            color: '#133E2B',
            padding: '12px 18px',
            borderRadius: 'var(--radius-btn)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.92rem',
            fontWeight: 700,
            marginBottom: '20px'
          }}
        >
          <CheckCircle2 size={18} color="var(--accent-pine)" />
          Đã lưu cấu hình AI thành công vào hệ thống cục bộ!
        </div>
      )}

      {/* Main Settings Form Card */}
      <form onSubmit={handleSave} className="card-tactile" style={{ padding: '32px' }}>
        {/* Provider Select */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Cpu size={16} color="var(--accent-pine)" /> Chọn Nhà Cung Cấp AI (Provider)
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="form-select"
          >
            <option value="gemini">Google Gemini AI (Khuyên dùng - Nhanh & Ổn định)</option>
            <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
            <option value="deepseek">DeepSeek AI</option>
          </select>
        </div>

        {/* Model Select */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            Mô Hình Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="form-select"
          >
            {provider === 'gemini' && (
              <>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Tốc độ phản hồi tức thì)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Độ chính xác cao & Phân tích sâu)</option>
              </>
            )}
            {provider === 'openai' && (
              <>
                <option value="gpt-4o-mini">GPT-4o mini</option>
                <option value="gpt-4o">GPT-4o Full</option>
              </>
            )}
            {provider === 'deepseek' && (
              <>
                <option value="deepseek-chat">DeepSeek Chat V3</option>
              </>
            )}
          </select>
        </div>

        {/* API Key Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Key size={16} color="var(--accent-amber)" /> API Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Nhập API Key của bạn..."
              className="form-input-text"
              style={{ paddingRight: '44px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--ink-secondary)', 
                cursor: 'pointer' 
              }}
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Default Learner Level */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            Trình Độ JLPT Mặc Định Của Người Học
          </label>
          <select
            value={learnerLevel}
            onChange={(e) => setLearnerLevel(e.target.value)}
            className="form-select"
          >
            <option value="N5">JLPT N5 (Sơ cấp cơ bản)</option>
            <option value="N4">JLPT N4 (Sơ cấp hoàn chỉnh)</option>
            <option value="N3">JLPT N3 (Trung cấp)</option>
          </select>
        </div>

        {/* Security Notice */}
        <div 
          style={{ 
            background: 'var(--bg-subtle)', 
            border: 'var(--border-dark)', 
            boxShadow: 'var(--shadow-sm)',
            padding: '14px 18px', 
            borderRadius: 'var(--radius-btn)', 
            fontSize: '0.85rem', 
            color: 'var(--ink-secondary)', 
            display: 'flex', 
            gap: '12px', 
            alignItems: 'center',
            marginBottom: '24px'
          }}
        >
          <ShieldCheck size={24} color="var(--accent-pine)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Bảo Mật Cục Bộ:</strong> API Key được lưu trữ nội bộ trên máy bạn thông qua SQLite và gửi trực tiếp qua Spring Boot backend. Không lưu khóa trên bất kỳ server trung gian nào.
          </span>
        </div>

        {/* Submit button */}
        <div>
          <button
            type="submit"
            className="btn-tactile primary lg"
          >
            <Save size={18} />
            <span>Lưu Thiết Lập</span>
          </button>
        </div>
      </form>
    </div>
  );
};
