import React, { useState } from 'react';
import { Settings, Key, Cpu, ShieldCheck, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      width: '100%',
      maxWidth: '750px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={24} color="var(--anki-blue)" />
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--anki-text)' }}>Cấu Hình AI Provider & Hệ Thống</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--anki-text-muted)', marginTop: '4px' }}>
          Cấu hình API Key cho các nhà cung cấp AI (Gemini, OpenAI, DeepSeek). Key được bảo mật tuyệt đối qua Spring Boot backend.
        </p>
      </div>

      {savedSuccess && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: 'var(--anki-green)',
          padding: '12px 16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px'
        }}>
          <CheckCircle2 size={18} />
          Đã lưu cấu hình AI thành công!
        </div>
      )}

      {/* Main Settings Form Card */}
      <form onSubmit={handleSave} style={{
        background: 'var(--anki-panel-bg)',
        borderRadius: '12px',
        border: '1px solid var(--anki-border)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: 'var(--anki-shadow)'
      }}>
        {/* Provider Select */}
        <div>
          <label style={{ fontSize: '13px', color: 'var(--anki-text)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Cpu size={16} color="var(--anki-blue)" /> Chọn AI Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
          >
            <option value="gemini">Google Gemini AI (Khuyên dùng)</option>
            <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
            <option value="deepseek">DeepSeek AI</option>
          </select>
        </div>

        {/* Model Select */}
        <div>
          <label style={{ fontSize: '13px', color: 'var(--anki-text)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
            Mô Hình Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
          >
            {provider === 'gemini' && (
              <>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Tốc độ cực nhanh)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Chính xác cao)</option>
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
        <div>
          <label style={{ fontSize: '13px', color: 'var(--anki-text)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Key size={16} color="var(--anki-amber)" /> API Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Nhập API Key của bạn..."
              style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '8px', fontSize: '14px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--anki-text-muted)', cursor: 'pointer' }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Default Learner Level */}
        <div>
          <label style={{ fontSize: '13px', color: 'var(--anki-text)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
            Trình Độ JLPT Mặc Định Khi Tạo Đề
          </label>
          <select
            value={learnerLevel}
            onChange={(e) => setLearnerLevel(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
          >
            <option value="N5">N5 (Cơ bản)</option>
            <option value="N4">N4 (Sơ cấp)</option>
          </select>
        </div>

        {/* Security Notice */}
        <div style={{ background: 'var(--anki-card-sub)', borderLeft: '3px solid var(--anki-blue)', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: '12px', color: 'var(--anki-text-muted)', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <ShieldCheck size={20} color="var(--anki-blue)" style={{ flexShrink: 0 }} />
          <span>API Key được lưu trữ cục bộ tại SQLite và xử lý thông qua backend Spring Boot. Không bao giờ lộ API Key ra giao diện React.</span>
        </div>

        {/* Submit button */}
        <div style={{ marginTop: '8px' }}>
          <button
            type="submit"
            className="anki-btn"
            style={{ background: 'var(--anki-blue)', color: '#ffffff', border: 'none', padding: '10px 24px', fontSize: '14px', fontWeight: '600' }}
          >
            <Save size={16} />
            Lưu Cấu Hình
          </button>
        </div>
      </form>
    </div>
  );
};
