import React, { useState, useEffect } from 'react';
import { api } from '../../../services/apiConfig';
import { Vocabulary } from '../../../types';
import { BookOpen, Plus, Trash2, Search, Filter } from 'lucide-react';

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

  const filteredVocabularies = vocabList.filter((v) => {
    const matchesQuery = 
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.reading.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.meaningVi.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = filterLevel === 'ALL' || v.jlptLevel === filterLevel;
    return matchesQuery && matchesLevel;
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} color="var(--anki-blue)" />
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--anki-text)' }}>Quản Lý Kho Từ Vựng</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--anki-text-muted)', marginTop: '4px' }}>
            Từ vựng lưu trữ tại đây sẽ được AI sử dụng để tự động sinh đề bài luyện dịch câu Việt $\rightarrow$ Nhật.
          </p>
        </div>

        <button className="anki-btn" style={{ background: 'var(--anki-blue)', color: '#fff', border: 'none' }} onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} />
          {showAddForm ? 'Đóng Form' : 'Thêm Từ Vựng Mới'}
        </button>
      </div>

      {/* Add Vocabulary Modal Panel */}
      {showAddForm && (
        <div style={{
          background: 'var(--anki-panel-bg)',
          borderRadius: '12px',
          border: '1px solid var(--anki-border)',
          padding: '20px',
          boxShadow: 'var(--anki-shadow)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--anki-blue)', marginBottom: '16px' }}>Thêm Từ Vựng Mới Vào Bộ Trích Xuất AI</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--anki-text-muted)', display: 'block', marginBottom: '4px' }}>Từ tiếng Nhật (Kanji/Word)</label>
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Ví dụ: 映画"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', fontSize: '14px' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--anki-text-muted)', display: 'block', marginBottom: '4px' }}>Cách đọc Hiragana (Reading)</label>
              <input
                type="text"
                value={newReading}
                onChange={(e) => setNewReading(e.target.value)}
                placeholder="Ví dụ: えいが"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--anki-text-muted)', display: 'block', marginBottom: '4px' }}>Nghĩa Tiếng Việt</label>
              <input
                type="text"
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                placeholder="Ví dụ: Bộ phim"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', fontSize: '14px' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--anki-text-muted)', display: 'block', marginBottom: '4px' }}>Loại Từ</label>
              <select
                value={newPartOfSpeech}
                onChange={(e) => setNewPartOfSpeech(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', fontSize: '14px' }}
              >
                <option value="Danh từ">Danh từ</option>
                <option value="Động từ">Động từ</option>
                <option value="Tính từ い">Tính từ い</option>
                <option value="Tính từ な">Tính từ な</option>
                <option value="Phó từ">Phó từ</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--anki-text-muted)', display: 'block', marginBottom: '4px' }}>Cấp độ JLPT</label>
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', fontSize: '14px' }}
              >
                <option value="N5">N5 (Cơ bản)</option>
                <option value="N4">N4 (Sơ cấp)</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: 'var(--anki-text-muted)', display: 'block', marginBottom: '4px' }}>Ví dụ tiếng Nhật</label>
              <input
                type="text"
                value={newExampleJa}
                onChange={(e) => setNewExampleJa(e.target.value)}
                placeholder="Ví dụ: 昨日の夜、映画を見ました。"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ gridColumn: 'span 2', marginTop: '4px' }}>
              <button type="submit" className="anki-btn" style={{ background: 'var(--anki-blue)', color: '#fff', border: 'none', padding: '8px 20px' }}>
                Lưu Từ Vựng
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color="var(--anki-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm từ vựng Kanji, Hiragana, Nghĩa Tiếng Việt..."
            style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', fontSize: '13px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={16} color="var(--anki-text-muted)" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: '8px', fontSize: '13px' }}
          >
            <option value="ALL">Tất cả cấp độ</option>
            <option value="N5">N5</option>
            <option value="N4">N4</option>
          </select>
        </div>
      </div>

      {/* Vocabulary Table */}
      <div style={{
        background: 'var(--anki-panel-bg)',
        borderRadius: '10px',
        border: '1px solid var(--anki-border)',
        overflow: 'hidden',
        boxShadow: 'var(--anki-shadow)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--anki-panel-header)', borderBottom: '1px solid var(--anki-border)', color: 'var(--anki-text-muted)' }}>
              <th style={{ padding: '12px 16px' }}>Từ Vựng (Kanji)</th>
              <th style={{ padding: '12px 16px' }}>Cách Đọc</th>
              <th style={{ padding: '12px 16px' }}>Nghĩa Tiếng Việt</th>
              <th style={{ padding: '12px 16px' }}>Cấp Độ</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredVocabularies.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--anki-border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: '700', fontSize: '16px', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--anki-text)' }}>
                  {item.word}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--anki-text-muted)', fontFamily: "'Noto Sans JP', sans-serif" }}>
                  {item.reading}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--anki-text)' }}>
                  {item.meaningVi}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: item.jlptLevel === 'N5' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                    color: item.jlptLevel === 'N5' ? 'var(--anki-green)' : 'var(--anki-blue)',
                    border: item.jlptLevel === 'N5' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(2, 132, 199, 0.3)'
                  }}>
                    {item.jlptLevel}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--anki-red)', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
