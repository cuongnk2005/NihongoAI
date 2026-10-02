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
            <FileText size={24} color="var(--anki-green)" />
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--anki-text)' }}>Quản Lý Kho Ngữ Pháp</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--anki-text-muted)', marginTop: '4px' }}>
            Các mẫu ngữ pháp lưu trữ tại đây sẽ được AI sử dụng để tự động sinh đề bài luyện dịch câu Việt $\rightarrow$ Nhật.
          </p>
        </div>

        <button className="anki-btn" style={{ background: 'var(--anki-green)', color: '#fff', border: 'none' }} onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} />
          {showAddForm ? 'Đóng Form' : 'Thêm Ngữ Pháp Mới'}
        </button>
      </div>

      {/* Add Grammar Modal Panel */}
      {showAddForm && (
        <div style={{
          background: 'var(--anki-panel-bg)',
          borderRadius: '12px',
          border: '1px solid var(--anki-border)',
          padding: '20px',
          boxShadow: 'var(--anki-shadow)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--anki-green)', marginBottom: '16px' }}>Thêm Mẫu Ngữ Pháp Mới Vào Kho AI</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--anki-text-muted)', display: 'block', marginBottom: '4px' }}>Mẫu Ngữ Pháp (Pattern)</label>
              <input
                type="text"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                placeholder="Ví dụ: ～たことがある"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', fontSize: '14px' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--anki-text-muted)', display: 'block', marginBottom: '4px' }}>Nghĩa Tiếng Việt</label>
              <input
                type="text"
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                placeholder="Ví dụ: Đã từng làm gì"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', fontSize: '14px' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--anki-text-muted)', display: 'block', marginBottom: '4px' }}>Cấu Trúc (Structure)</label>
              <input
                type="text"
                value={newStructure}
                onChange={(e) => setNewStructure(e.target.value)}
                placeholder="Ví dụ: V-た + ことがある"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', fontSize: '14px' }}
              />
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
              <label style={{ fontSize: '12px', color: 'var(--anki-text-muted)', display: 'block', marginBottom: '4px' }}>Giải thích chi tiết (tùy chọn)</label>
              <textarea
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Dùng để nói về trải nghiệm hoặc kinh nghiệm trong quá khứ..."
                rows={2}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
              />
            </div>
            <div style={{ gridColumn: 'span 2', marginTop: '4px' }}>
              <button type="submit" className="anki-btn" style={{ background: 'var(--anki-green)', color: '#fff', border: 'none', padding: '8px 20px' }}>
                Lưu Mẫu Ngữ Pháp
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
            placeholder="Tìm kiếm mẫu ngữ pháp, cấu trúc hoặc nghĩa..."
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

      {/* Grammar Table */}
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
              <th style={{ padding: '12px 16px' }}>Mẫu Ngữ Pháp</th>
              <th style={{ padding: '12px 16px' }}>Nghĩa Tiếng Việt</th>
              <th style={{ padding: '12px 16px' }}>Cấu Trúc</th>
              <th style={{ padding: '12px 16px' }}>Cấp Độ</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrammars.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--anki-border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: '700', fontSize: '16px', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--anki-green)' }}>
                  {item.pattern}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--anki-text)', fontWeight: '500' }}>
                  {item.meaningVi}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--anki-text-muted)', fontFamily: 'monospace' }}>
                  {item.structure}
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
