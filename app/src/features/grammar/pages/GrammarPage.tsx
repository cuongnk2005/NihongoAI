import React, { useState, useEffect } from 'react';
import { api } from '../../../services/apiConfig';
import { Grammar } from '../../../types';
import { FileText, Plus, Trash2, Search, Filter } from 'lucide-react';

export const GrammarPage: React.FC = () => {
  const [grammarList, setGrammarList] = useState<Grammar[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form State
  const [newPattern, setNewPattern] = useState<string>('');
  const [newMeaning, setNewMeaning] = useState<string>('');
  const [newStructure, setNewStructure] = useState<string>('');
  const [newExplanation, setNewExplanation] = useState<string>('');
  const [newLevel, setNewLevel] = useState<string>('N4');

  useEffect(() => {
    loadGrammars();
  }, []);

  const loadGrammars = async () => {
    const data = await api.getGrammars();
    setGrammarList(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPattern || !newMeaning) return;

    await api.createGrammar({
      pattern: newPattern,
      meaningVi: newMeaning,
      structure: newStructure,
      explanation: newExplanation,
      jlptLevel: newLevel
    });

    setNewPattern('');
    setNewMeaning('');
    setNewStructure('');
    setNewExplanation('');
    setShowAddForm(false);
    loadGrammars();
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await api.deleteGrammar(id);
    loadGrammars();
  };

  const filteredGrammars = grammarList.filter((g) => {
    const matchesQuery =
      g.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.meaningVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.structure && g.structure.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = filterLevel === 'ALL' || g.jlptLevel === filterLevel;
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
            <FileText size={24} color="#2ecc71" />
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>Quản Lý Kho Ngữ Pháp</h2>
          </div>
          <p style={{ fontSize: '13px', color: '#999999', marginTop: '4px' }}>
            Các mẫu ngữ pháp lưu trữ tại đây sẽ được AI sử dụng để tự động sinh đề bài luyện dịch câu Việt $\rightarrow$ Nhật.
          </p>
        </div>

        <button className="anki-btn" style={{ background: '#2ecc71', color: '#fff', border: 'none' }} onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} />
          {showAddForm ? 'Đóng Form' : 'Thêm Ngữ Pháp Mới'}
        </button>
      </div>

      {/* Add Grammar Modal Panel */}
      {showAddForm && (
        <div style={{
          background: '#1f1f1f',
          borderRadius: '12px',
          border: '1px solid #333333',
          padding: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2ecc71', marginBottom: '16px' }}>Thêm Mẫu Ngữ Pháp Mới Vào Kho AI</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#aaaaaa', display: 'block', marginBottom: '4px' }}>Mẫu Ngữ Pháp (Pattern)</label>
              <input
                type="text"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                placeholder="Ví dụ: ～たことがある"
                style={{ width: '100%', padding: '8px 12px', background: '#282828', border: '1px solid #3b3c40', borderRadius: '6px', color: '#fff', fontSize: '14px' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#aaaaaa', display: 'block', marginBottom: '4px' }}>Nghĩa Tiếng Việt</label>
              <input
                type="text"
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                placeholder="Ví dụ: Đã từng làm gì"
                style={{ width: '100%', padding: '8px 12px', background: '#282828', border: '1px solid #3b3c40', borderRadius: '6px', color: '#fff', fontSize: '14px' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#aaaaaa', display: 'block', marginBottom: '4px' }}>Cấu Trúc (Structure)</label>
              <input
                type="text"
                value={newStructure}
                onChange={(e) => setNewStructure(e.target.value)}
                placeholder="Ví dụ: V-た + ことがある"
                style={{ width: '100%', padding: '8px 12px', background: '#282828', border: '1px solid #3b3c40', borderRadius: '6px', color: '#fff', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#aaaaaa', display: 'block', marginBottom: '4px' }}>Cấp độ JLPT</label>
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: '#282828', border: '1px solid #3b3c40', borderRadius: '6px', color: '#fff', fontSize: '14px' }}
              >
                <option value="N5">N5 (Cơ bản)</option>
                <option value="N4">N4 (Sơ cấp)</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#aaaaaa', display: 'block', marginBottom: '4px' }}>Giải thích chi tiết (tùy chọn)</label>
              <textarea
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Dùng để nói về trải nghiệm hoặc kinh nghiệm trong quá khứ..."
                rows={2}
                style={{ width: '100%', padding: '8px 12px', background: '#282828', border: '1px solid #3b3c40', borderRadius: '6px', color: '#fff', fontSize: '14px', resize: 'vertical' }}
              />
            </div>
            <div style={{ gridColumn: 'span 2', marginTop: '4px' }}>
              <button type="submit" className="anki-btn" style={{ background: '#2ecc71', color: '#fff', border: 'none', padding: '8px 20px' }}>
                Lưu Mẫu Ngữ Pháp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color="#888888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm mẫu ngữ pháp, cấu trúc hoặc nghĩa..."
            style={{ width: '100%', padding: '9px 12px 9px 36px', background: '#1f1f1f', border: '1px solid #3b3c40', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={16} color="#888888" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={{ padding: '9px 12px', background: '#1f1f1f', border: '1px solid #3b3c40', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
          >
            <option value="ALL">Tất cả cấp độ</option>
            <option value="N5">N5</option>
            <option value="N4">N4</option>
          </select>
        </div>
      </div>

      {/* Grammar Anki Dark Table */}
      <div style={{
        background: '#1f1f1f',
        borderRadius: '10px',
        border: '1px solid #333333',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#25262a', borderBottom: '1px solid #333333', color: '#aaaaaa' }}>
              <th style={{ padding: '12px 16px' }}>Mẫu Ngữ Pháp</th>
              <th style={{ padding: '12px 16px' }}>Nghĩa Tiếng Việt</th>
              <th style={{ padding: '12px 16px' }}>Cấu Trúc</th>
              <th style={{ padding: '12px 16px' }}>Cấp Độ</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrammars.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #2a2b30' }}>
                <td style={{ padding: '12px 16px', fontWeight: '700', fontSize: '16px', fontFamily: "'Noto Sans JP', sans-serif", color: '#2ecc71' }}>
                  {item.pattern}
                </td>
                <td style={{ padding: '12px 16px', color: '#ffffff', fontWeight: '500' }}>
                  {item.meaningVi}
                </td>
                <td style={{ padding: '12px 16px', color: '#cccccc', fontFamily: 'monospace' }}>
                  {item.structure}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: item.jlptLevel === 'N5' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(0, 153, 255, 0.15)',
                    color: item.jlptLevel === 'N5' ? '#2ecc71' : '#0099ff',
                    border: item.jlptLevel === 'N5' ? '1px solid rgba(46, 204, 113, 0.3)' : '1px solid rgba(0, 153, 255, 0.3)'
                  }}>
                    {item.jlptLevel}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '4px' }}
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
