import React, { useState, useEffect } from 'react';
import { api } from '../../../services/apiConfig';
import { Vocabulary } from '../../../types';
import { Plus, Trash2, Search, Volume2, X } from 'lucide-react';

export const VocabularyPage: React.FC = () => {
  const [vocabList, setVocabList] = useState<Vocabulary[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form State
  const [newWord, setNewWord] = useState<string>('');
  const [newReading, setNewReading] = useState<string>('');
  const [newMeaning, setNewMeaning] = useState<string>('');
  const [newPartOfSpeech, setNewPartOfSpeech] = useState<string>('Danh từ');
  const [newLevel, setNewLevel] = useState<string>('N4');
  const [newExampleJa, setNewExampleJa] = useState<string>('');
  const [newExampleVi, setNewExampleVi] = useState<string>('');

  useEffect(() => {
    loadVocabularies();
  }, []);

  const loadVocabularies = async () => {
    const data = await api.getVocabularies();
    setVocabList(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord || !newMeaning) return;

    await api.createVocabulary({
      word: newWord,
      reading: newReading,
      meaningVi: newMeaning,
      partOfSpeech: newPartOfSpeech,
      jlptLevel: newLevel,
      exampleSentenceJa: newExampleJa,
      exampleSentenceVi: newExampleVi
    });

    setNewWord('');
    setNewReading('');
    setNewMeaning('');
    setNewExampleJa('');
    setNewExampleVi('');
    setShowAddForm(false);
    loadVocabularies();
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await api.deleteVocabulary(id);
    loadVocabularies();
  };

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredVocabularies = vocabList.filter((v) => {
    const matchesQuery = 
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.reading.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.meaningVi.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = filterLevel === 'ALL' || v.jlptLevel === filterLevel;
    return matchesQuery && matchesLevel;
  });

  return (
    <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>
            📖 Quản lý Kho Từ vựng
          </h2>
          <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
            Kho từ vựng có cấu trúc phục vụ trích xuất tự động khi sinh bài luyện dịch câu & hội thoại AI.
          </p>
        </div>

        <button className="btn-tactile primary" onClick={() => setShowAddForm(true)}>
          <Plus size={16} /> Thêm Từ vựng
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '18px',
          flexWrap: 'wrap'
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ink-muted)' }} />
          <input
            type="text"
            className="form-input-text"
            style={{ paddingLeft: '38px' }}
            placeholder="Tìm theo Kanji, Hiragana hoặc nghĩa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* JLPT Level Chips */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'N5', 'N4', 'N3'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`btn-tactile sm ${filterLevel === lvl ? 'primary' : ''}`}
            >
              {lvl === 'ALL' ? 'Tất cả' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Table */}
      <div className="table-container" style={{ marginBottom: '24px' }}>
        <table className="tactile-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Từ vựng (Kanji)</th>
              <th style={{ width: '20%' }}>Cách đọc (Kana)</th>
              <th style={{ width: '30%' }}>Nghĩa Tiếng Việt</th>
              <th style={{ width: '12%' }}>Loại từ</th>
              <th style={{ width: '8%' }}>JLPT</th>
              <th style={{ textAlign: 'center', width: '8%' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredVocabularies.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-muted)' }}>
                  Không tìm thấy từ vựng nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredVocabularies.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="japanese-kanji" style={{ fontSize: '1.25rem' }}>{v.word}</span>
                      <button 
                        className="btn-tactile sm"
                        style={{ padding: '2px 6px', border: 'none', background: 'transparent', boxShadow: 'none' }}
                        onClick={() => playSpeech(v.word)}
                        title="Phát âm"
                      >
                        <Volume2 size={15} color="var(--accent-pine)" />
                      </button>
                    </div>
                  </td>
                  <td style={{ color: 'var(--accent-vermilion)', fontWeight: 600 }}>{v.reading}</td>
                  <td style={{ fontWeight: 600 }}>{v.meaningVi}</td>
                  <td>
                    <span className="meta-pill" style={{ fontSize: '0.75rem', background: '#E2E8F0', color: '#0F172A' }}>
                      {v.partOfSpeech || 'Danh từ'}
                    </span>
                  </td>
                  <td>
                    <span className="meta-pill" style={{ fontSize: '0.75rem' }}>
                      {v.jlptLevel || 'N4'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-tactile sm vermilion"
                      style={{ padding: '4px 8px' }}
                      onClick={() => handleDelete(v.id)}
                      title="Xóa từ vựng"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddForm && (
        <div className="modal-backdrop" onClick={() => setShowAddForm(false)}>
          <div className="modal-box" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreate}>
              <div className="modal-head">
                <h3 className="modal-heading">Thêm Từ Vựng Mới</h3>
                <button type="button" className="btn-tactile sm" onClick={() => setShowAddForm(false)}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Từ tiếng Nhật (Kanji):</label>
                  <input
                    type="text"
                    className="form-input-text"
                    placeholder="Ví dụ: 映画"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="form-label">Cách đọc (Hiragana):</label>
                  <input
                    type="text"
                    className="form-input-text"
                    placeholder="Ví dụ: えいが"
                    value={newReading}
                    onChange={(e) => setNewReading(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Nghĩa Tiếng Việt:</label>
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="Ví dụ: Bộ phim / Điện ảnh"
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Loại từ:</label>
                  <select
                    className="form-select"
                    value={newPartOfSpeech}
                    onChange={(e) => setNewPartOfSpeech(e.target.value)}
                  >
                    <option value="Danh từ">Danh từ</option>
                    <option value="Động từ nhóm 1">Động từ nhóm 1</option>
                    <option value="Động từ nhóm 2">Động từ nhóm 2</option>
                    <option value="Động từ nhóm 3">Động từ nhóm 3</option>
                    <option value="Tính từ い">Tính từ い</option>
                    <option value="Tính từ な">Tính từ な</option>
                    <option value="Phó từ">Phó từ</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Cấp độ JLPT:</label>
                  <select
                    className="form-select"
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                  >
                    <option value="N5">N5</option>
                    <option value="N4">N4</option>
                    <option value="N3">N3</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Câu ví dụ tiếng Nhật (tùy chọn):</label>
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="Ví dụ: 友達と映画を見ました。"
                  value={newExampleJa}
                  onChange={(e) => setNewExampleJa(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Dịch nghĩa ví dụ (tùy chọn):</label>
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="Ví dụ: Tôi đã xem phim cùng với bạn."
                  value={newExampleVi}
                  onChange={(e) => setNewExampleVi(e.target.value)}
                />
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-tactile" onClick={() => setShowAddForm(false)}>Hủy</button>
                <button type="submit" className="btn-tactile primary">Lưu Từ Vựng</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
