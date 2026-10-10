import React, { useState, useEffect } from 'react';
import { api } from '../../../services/apiConfig';
import { Grammar } from '../../../types';
import { Plus, Trash2, Search, X } from 'lucide-react';

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
    <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>
            📜 Quản lý Kho Ngữ pháp
          </h2>
          <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
            Mẫu câu và cấu trúc ngữ pháp có cấu trúc làm điều kiện sinh bài tập dịch câu Việt $\rightarrow$ Nhật.
          </p>
        </div>

        <button className="btn-tactile primary" onClick={() => setShowAddForm(true)}>
          <Plus size={16} /> Thêm Ngữ pháp
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
            placeholder="Tìm theo mẫu câu, cấu trúc hoặc ý nghĩa..."
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

      {/* Grammar Table */}
      <div className="table-container" style={{ marginBottom: '24px' }}>
        <table className="tactile-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Mẫu câu</th>
              <th style={{ width: '26%' }}>Ý nghĩa Tiếng Việt</th>
              <th style={{ width: '32%' }}>Cấu trúc biến đổi</th>
              <th style={{ width: '10%' }}>JLPT</th>
              <th style={{ textAlign: 'center', width: '10%' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrammars.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-muted)' }}>
                  Không tìm thấy mẫu ngữ pháp nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredGrammars.map((g) => (
                <tr key={g.id}>
                  <td>
                    <span className="japanese-kanji" style={{ fontSize: '1.15rem', color: 'var(--accent-pine)' }}>
                      {g.pattern}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{g.meaningVi}</td>
                  <td>
                    <code style={{ background: '#FFE8D6', color: '#0F172A', padding: '2px 8px', borderRadius: '4px', border: '1px solid #0F172A', fontSize: '0.82rem', fontWeight: 700 }}>
                      {g.structure || 'V-plain'}
                    </code>
                  </td>
                  <td>
                    <span className="meta-pill" style={{ fontSize: '0.75rem' }}>
                      {g.jlptLevel || 'N4'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-tactile sm vermilion"
                      style={{ padding: '4px 8px' }}
                      onClick={() => handleDelete(g.id)}
                      title="Xóa mẫu ngữ pháp"
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
                <h3 className="modal-heading">Thêm Mẫu Ngữ Pháp Mới</h3>
                <button type="button" className="btn-tactile sm" onClick={() => setShowAddForm(false)}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Mẫu ngữ pháp (Pattern):</label>
                  <input
                    type="text"
                    className="form-input-text"
                    placeholder="Ví dụ: ～たことがある"
                    value={newPattern}
                    onChange={(e) => setNewPattern(e.target.value)}
                    required
                    autoFocus
                  />
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
                <label className="form-label">Ý nghĩa Tiếng Việt:</label>
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="Ví dụ: Đã từng làm gì đó (kinh nghiệm)"
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Cấu trúc công thức biến đổi (Structure):</label>
                <input
                  type="text"
                  className="form-input-text"
                  placeholder="Ví dụ: V-た + ことがある"
                  value={newStructure}
                  onChange={(e) => setNewStructure(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Giải thích chi tiết (tùy chọn):</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Dùng để diễn tả trải nghiệm trong quá khứ..."
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                />
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-tactile" onClick={() => setShowAddForm(false)}>Hủy</button>
                <button type="submit" className="btn-tactile primary">Lưu Ngữ Pháp</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
