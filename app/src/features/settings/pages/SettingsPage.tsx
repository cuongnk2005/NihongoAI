import React, { useState, useEffect } from 'react';
import { api } from '../../../services/apiConfig';
import {
  Key,
  Cpu,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Zap
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [provider, setProvider] = useState<string>('freellmapi');
  
  // FreeLLMAPI settings
  const [freellmBaseUrl, setFreellmBaseUrl] = useState<string>('http://localhost:3001/v1');
  const [freellmApiKey, setFreellmApiKey] = useState<string>('');
  const [freellmModel, setFreellmModel] = useState<string>('gemini-2.0-flash');
  
  // Gemini settings
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [geminiModel, setGeminiModel] = useState<string>('gemini-1.5-flash');

  // Common UI states
  const [showKey, setShowKey] = useState<boolean>(false);
  const [learnerLevel, setLearnerLevel] = useState<string>('N4');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copiedDocker, setCopiedDocker] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const dockerCommand = 'docker run -d -p 3001:3001 --name freellmapi tashfeenahmed/freellmapi';

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await api.getSettings();
        if (settings['ai.provider']) setProvider(settings['ai.provider']);
        if (settings['ai.freellmapi.base-url']) setFreellmBaseUrl(settings['ai.freellmapi.base-url']);
        if (settings['ai.freellmapi.api-key']) setFreellmApiKey(settings['ai.freellmapi.api-key']);
        if (settings['ai.freellmapi.model']) setFreellmModel(settings['ai.freellmapi.model']);
        if (settings['ai.gemini.api-key']) setGeminiApiKey(settings['ai.gemini.api-key']);
        if (settings['ai.gemini.model']) setGeminiModel(settings['ai.gemini.model']);
        if (settings['learner.level']) setLearnerLevel(settings['learner.level']);
      } catch (err) {
        console.warn('Could not load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveSetting('ai.provider', provider);
      await api.saveSetting('ai.freellmapi.base-url', freellmBaseUrl);
      await api.saveSetting('ai.freellmapi.api-key', freellmApiKey);
      await api.saveSetting('ai.freellmapi.model', freellmModel);
      await api.saveSetting('ai.gemini.api-key', geminiApiKey);
      await api.saveSetting('ai.gemini.model', geminiModel);
      await api.saveSetting('learner.level', learnerLevel);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleCopyDocker = () => {
    navigator.clipboard.writeText(dockerCommand);
    setCopiedDocker(true);
    setTimeout(() => setCopiedDocker(false), 2000);
  };

  return (
    <div style={{ width: '100%', maxWidth: '820px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>
          ⚙️ Cấu Hình AI Provider & Hệ Thống
        </h2>
        <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
          Tích hợp <strong>FreeLLMAPI</strong> (7.4 tỷ tokens/tháng miễn phí, 34 nhà cung cấp, 635 mô hình) hoặc kết nối trực tiếp Google Gemini, OpenAI, DeepSeek.
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
          Đã lưu thiết lập thành công! Các tính năng Luyện Dịch Câu & Kaiwa sẽ sử dụng cấu hình mới ngay lập tức.
        </div>
      )}

      {/* Main Settings Form Card */}
      <form onSubmit={handleSave} className="card-tactile" style={{ padding: '32px' }}>
        {/* Provider Select */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Cpu size={16} color="var(--accent-pine)" /> Chọn Nhà Cung Cấp AI (AI Provider)
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="form-select"
            style={{ fontWeight: 600 }}
          >
            <option value="freellmapi">
              🚀 FreeLLMAPI (Khuyên dùng: 7.4 tỷ tokens/tháng miễn phí • 34 Providers • 635 Models)
            </option>
            <option value="gemini">Google Gemini AI (Direct API Key từ Google AI Studio)</option>
            <option value="openai">OpenAI / DeepSeek / Tùy chỉnh endpoint OpenAI-compatible khác</option>
            <option value="mock">Local Mock (Offline - Dữ liệu ngân hàng câu mẫu nội bộ chuẩn)</option>
          </select>
        </div>

        {/* FreeLLMAPI Special Section */}
        {provider === 'freellmapi' && (
          <div
            style={{
              background: '#F0FDF4',
              border: '2px solid #86EFAC',
              borderRadius: 'var(--radius-btn)',
              padding: '20px',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#166534', fontSize: '0.98rem' }}>
                <Zap size={18} color="#16A34A" />
                Cấu hình kết nối FreeLLMAPI Router
              </div>
              <a
                href="https://github.com/tashfeenahmed/freellmapi"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#15803D',
                  textDecoration: 'underline'
                }}
              >
                <span>Xem GitHub FreeLLMAPI</span>
                <ExternalLink size={13} />
              </a>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '14px', lineHeight: 1.5 }}>
              FreeLLMAPI hoạt động như một router trung gian thông minh, tự động gộp hạn ngạch miễn phí từ hàng chục dịch vụ AI lớn (Groq, Gemini, Mistral, HuggingFace, Cloudflare...) và tự động chuyển đổi khi chạm giới hạn rate-limit.
            </p>

            {/* Docker Quickstart Box */}
            <div
              style={{
                background: '#0F172A',
                color: '#F8FAFC',
                padding: '12px 14px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '18px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <Terminal size={16} color="#38BDF8" style={{ flexShrink: 0 }} />
                <span style={{ wordBreak: 'break-all' }}>{dockerCommand}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyDocker}
                className="btn-tactile sm"
                style={{
                  padding: '4px 10px',
                  background: copiedDocker ? '#22C55E' : '#334155',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.75rem',
                  flexShrink: 0
                }}
                title="Sao chép lệnh chạy Docker"
              >
                {copiedDocker ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedDocker ? 'Đã chép' : 'Chép lệnh'}</span>
              </button>
            </div>

            {/* FreeLLMAPI Base URL */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#14532D', display: 'block', marginBottom: '6px' }}>
                Base URL của FreeLLMAPI (Endpoint OpenAI-compatible)
              </label>
              <input
                type="text"
                value={freellmBaseUrl}
                onChange={(e) => setFreellmBaseUrl(e.target.value)}
                placeholder="http://localhost:3001/v1"
                className="form-input-text"
                required
              />
              <span style={{ fontSize: '0.78rem', color: '#166534', marginTop: '4px', display: 'block' }}>
                Mặc định khi chạy Docker là <code>http://localhost:3001/v1</code> (hoặc URL remote nếu bạn triển khai trên server riêng).
              </span>
            </div>

            {/* FreeLLMAPI Model Selection */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#14532D', display: 'block', marginBottom: '6px' }}>
                Mô hình AI (FreeLLMAPI Model Routing)
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={freellmModel}
                  onChange={(e) => setFreellmModel(e.target.value)}
                  placeholder="gemini-2.0-flash, gpt-4o-mini, deepseek-chat..."
                  className="form-input-text"
                  style={{ flex: 1 }}
                  required
                />
                <select
                  onChange={(e) => {
                    if (e.target.value) setFreellmModel(e.target.value);
                  }}
                  className="form-select"
                  style={{ width: '190px', fontSize: '0.82rem' }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Chọn nhanh model...
                  </option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash (Siêu nhanh)</option>
                  <option value="gpt-4o-mini">gpt-4o-mini (Chuẩn xác)</option>
                  <option value="deepseek-chat">deepseek-chat (V3)</option>
                  <option value="qwen-2.5-72b-instruct">qwen-2.5-72b</option>
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b</option>
                  <option value="claude-3-5-haiku">claude-3-5-haiku</option>
                </select>
              </div>
            </div>

            {/* FreeLLMAPI Unified API Key */}
            <div>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#14532D', display: 'block', marginBottom: '6px' }}>
                Unified API Key (Tùy chọn)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={freellmApiKey}
                  onChange={(e) => setFreellmApiKey(e.target.value)}
                  placeholder="Để trống nếu chạy local không bật auth, hoặc dán Unified Key từ trang Keys"
                  className="form-input-text"
                  style={{ paddingRight: '44px' }}
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
          </div>
        )}

        {/* Gemini Direct Section */}
        {provider === 'gemini' && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                Mô Hình Google Gemini
              </label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="form-select"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Phản hồi tức thì, tối ưu chi phí)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Độ chính xác cao & Phân tích sâu)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Key size={16} color="var(--accent-amber)" /> Gemini API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
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
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)', marginTop: '4px', display: 'block' }}>
                Lấy API Key miễn phí trực tiếp tại Google AI Studio: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>aistudio.google.com</a>
              </span>
            </div>
          </div>
        )}

        {/* OpenAI / Custom Endpoint Section */}
        {provider === 'openai' && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Endpoint Base URL
              </label>
              <input
                type="text"
                value={freellmBaseUrl}
                onChange={(e) => setFreellmBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1 hoặc https://api.deepseek.com/v1"
                className="form-input-text"
                required
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Tên Model
              </label>
              <input
                type="text"
                value={freellmModel}
                onChange={(e) => setFreellmModel(e.target.value)}
                placeholder="gpt-4o-mini hoặc deepseek-chat"
                className="form-input-text"
                required
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Key size={16} color="var(--accent-amber)" /> API Key
              </label>
              <input
                type={showKey ? 'text' : 'password'}
                value={freellmApiKey}
                onChange={(e) => setFreellmApiKey(e.target.value)}
                placeholder="sk-..."
                className="form-input-text"
                required
              />
            </div>
          </div>
        )}

        {/* Default Learner Level */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            Trình Độ JLPT Mặc Định Của Người Học
          </label>
          <select
            value={learnerLevel}
            onChange={(e) => setLearnerLevel(e.target.value)}
            className="form-select"
            style={{ fontWeight: 600 }}
          >
            <option value="N5">JLPT N5 (Sơ cấp cơ bản)</option>
            <option value="N4">JLPT N4 (Sơ cấp hoàn chỉnh)</option>
            <option value="N3">JLPT N3 (Trung cấp)</option>
            <option value="N2">JLPT N2 (Trung thượng cấp)</option>
            <option value="N1">JLPT N1 (Cao cấp)</option>
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
            <strong>Bảo Mật Nội Bộ:</strong> Tất cả khóa và cấu hình được lưu trực tiếp trên cơ sở dữ liệu SQLite tại máy tính của bạn và do Spring Boot backend xử lý. Nếu dịch vụ AI tạm ngắt kết nối, hệ thống sẽ tự động dùng câu mẫu nội bộ nên bạn không bao giờ bị gián đoạn bài học.
          </span>
        </div>

        {/* Submit button */}
        <div>
          <button type="submit" disabled={isLoading} className="btn-tactile primary lg">
            <Save size={18} />
            <span>Lưu Thiết Lập AI</span>
          </button>
        </div>
      </form>
    </div>
  );
};
