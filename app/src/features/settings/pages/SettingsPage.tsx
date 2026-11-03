import React, { useState, useEffect } from 'react';
import { api } from '../../../services/apiConfig';
import {
  Save,
  CheckCircle2,
  Volume2,
  BookOpen,
  Calendar,
  Layers,
  ShieldCheck,
  Languages
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  // Learner study preferences
  const [learnerLevel, setLearnerLevel] = useState<string>('N4');
  const [newCardsPerDay, setNewCardsPerDay] = useState<string>('20');
  const [maxReviewsPerDay, setMaxReviewsPerDay] = useState<string>('100');
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(true);
  const [showFurigana, setShowFurigana] = useState<boolean>(true);

  // Status & feedback
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await api.getSettings();
        if (settings['learner.level']) setLearnerLevel(settings['learner.level']);
        if (settings['learner.newCardsPerDay']) setNewCardsPerDay(settings['learner.newCardsPerDay']);
        if (settings['learner.maxReviewsPerDay']) setMaxReviewsPerDay(settings['learner.maxReviewsPerDay']);
        if (settings['learner.autoPlayAudio']) setAutoPlayAudio(settings['learner.autoPlayAudio'] === 'true');
        if (settings['learner.showFurigana']) setShowFurigana(settings['learner.showFurigana'] === 'true');
      } catch (err) {
        console.warn('Could not load study settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveSetting('learner.level', learnerLevel);
      await api.saveSetting('learner.newCardsPerDay', newCardsPerDay);
      await api.saveSetting('learner.maxReviewsPerDay', maxReviewsPerDay);
      await api.saveSetting('learner.autoPlayAudio', autoPlayAudio ? 'true' : 'false');
      await api.saveSetting('learner.showFurigana', showFurigana ? 'true' : 'false');

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save study settings:', err);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '780px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>
          ⚙️ Cài Đặt Học Tập (Study Preferences)
        </h2>
        <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
          Tùy chỉnh mục tiêu JLPT cá nhân, hạn mức số thẻ ôn tập hàng ngày và trải nghiệm luyện thi của bạn.
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
          Đã lưu thiết lập học tập thành công!
        </div>
      )}

      {/* Main Settings Form Card */}
      <form onSubmit={handleSave} className="card-tactile" style={{ padding: '32px' }}>
        {/* Section 1: JLPT Target Level */}
        <div style={{ marginBottom: '26px' }}>
          <label
            style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              color: 'var(--ink-primary)'
            }}
          >
            <BookOpen size={17} color="var(--accent-pine)" />
            Mục Tiêu Trình Độ JLPT Của Bạn
          </label>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', marginBottom: '10px' }}>
            Hệ thống AI sẽ ưu tiên gợi ý các cấu trúc ngữ pháp và từ vựng thích ứng theo cấp độ này.
          </p>
          <select
            value={learnerLevel}
            onChange={(e) => setLearnerLevel(e.target.value)}
            className="form-select"
            style={{ fontWeight: 600, fontSize: '0.92rem' }}
          >
            <option value="N5">JLPT N5 (Sơ cấp cơ bản - Hiragana, Katakana, chào hỏi)</option>
            <option value="N4">JLPT N4 (Sơ cấp hoàn chỉnh - Giao tiếp hàng ngày, ngữ pháp cơ bản)</option>
            <option value="N3">JLPT N3 (Trung cấp - Giao tiếp tự nhiên, đọc hiểu tổng hợp)</option>
            <option value="N2">JLPT N2 (Trung thượng cấp - Đọc báo chí, làm việc công sở)</option>
            <option value="N1">JLPT N1 (Cao cấp - Thành thạo như người bản xứ)</option>
          </select>
        </div>

        {/* Section 2: Daily Learning Limits */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '26px'
          }}
        >
          <div>
            <label
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                color: 'var(--ink-primary)'
              }}
            >
              <Calendar size={16} color="var(--accent-amber)" />
              Thẻ Mới Mỗi Ngày (New Cards / Day)
            </label>
            <select
              value={newCardsPerDay}
              onChange={(e) => setNewCardsPerDay(e.target.value)}
              className="form-select"
              style={{ fontWeight: 600 }}
            >
              <option value="10">10 thẻ mới / ngày (Nhẹ nhàng)</option>
              <option value="20">20 thẻ mới / ngày (Khuyên dùng)</option>
              <option value="30">30 thẻ mới / ngày (Tăng tốc)</option>
              <option value="50">50 thẻ mới / ngày (Cường độ cao)</option>
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                color: 'var(--ink-primary)'
              }}
            >
              <Layers size={16} color="var(--accent-cobalt)" />
              Số Thẻ Ôn Tập Tối Đa (Max Reviews / Day)
            </label>
            <select
              value={maxReviewsPerDay}
              onChange={(e) => setMaxReviewsPerDay(e.target.value)}
              className="form-select"
              style={{ fontWeight: 600 }}
            >
              <option value="50">Tối đa 50 thẻ / ngày</option>
              <option value="100">Tối đa 100 thẻ / ngày (Khuyên dùng)</option>
              <option value="200">Tối đa 200 thẻ / ngày</option>
              <option value="9999">Không giới hạn (Ôn tập hết thẻ đến hạn)</option>
            </select>
          </div>
        </div>

        {/* Section 3: Learning Experience & Audio */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: 'var(--border-dark)',
            borderRadius: 'var(--radius-btn)',
            padding: '20px',
            marginBottom: '26px'
          }}
        >
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--ink-primary)', marginBottom: '14px', textTransform: 'uppercase' }}>
            Trải Nghiệm & Tương Tác Thẻ Học
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoPlayAudio}
                onChange={(e) => setAutoPlayAudio(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-pine)' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={16} color="var(--accent-pine)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
                  Tự động phát âm thanh tiếng Nhật khi lật xem đáp án
                </span>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showFurigana}
                onChange={(e) => setShowFurigana(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-pine)' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Languages size={16} color="var(--accent-cobalt)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
                  Hiển thị cách đọc Hiragana / Furigana hỗ trợ khi học thẻ Kanji
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 4: Security & Backend Architecture Note */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1.5px solid #CBD5E1',
            padding: '14px 18px',
            borderRadius: 'var(--radius-btn)',
            fontSize: '0.84rem',
            color: 'var(--ink-secondary)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '26px'
          }}
        >
          <ShieldCheck size={26} color="var(--accent-pine)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Bảo mật chuẩn hệ thống:</strong> Toàn bộ API Key và mô hình AI được quản lý độc lập tại file cấu hình bảo mật <code>.env</code> ở Backend. Không lưu trữ hay để lộ thông tin nhạy cảm trên giao diện web.
          </span>
        </div>

        {/* Submit button */}
        <div>
          <button type="submit" disabled={isLoading} className="btn-tactile primary lg">
            <Save size={18} />
            <span>Lưu Thiết Lập Học Tập</span>
          </button>
        </div>
      </form>
    </div>
  );
};
