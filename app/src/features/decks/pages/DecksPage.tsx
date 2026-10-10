import React, { useState } from 'react';
import { Settings, Trash2, Edit3, Plus, AlertTriangle, X, ChevronRight, ChevronDown } from 'lucide-react';

interface DeckNode {
  id: string;
  name: string;
  newCount: number;
  learningCount: number;
  dueCount: number;
  level: number;
  expanded?: boolean;
  children?: DeckNode[];
}

interface DecksPageProps {
  onStudyDeck?: () => void;
}

export const DecksPage: React.FC<DecksPageProps> = ({ onStudyDeck }) => {
  const [selectedDeckId, setSelectedDeckId] = useState<string>('jlptN4');
  const [menuDeck, setMenuDeck] = useState<DeckNode | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<DeckNode | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newDeckName, setNewDeckName] = useState<string>('');
  const [renameDeck, setRenameDeck] = useState<DeckNode | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');

  const initialDecks: DeckNode[] = [
    {
      id: 'minna',
      name: 'Minna no Nihongo (Bài 1 - 25)',
      newCount: 15,
      learningCount: 8,
      dueCount: 24,
      level: 0,
      expanded: true,
      children: [
        { id: 'minna-bai1-10', name: 'Bài 1 - 10 (Sơ cấp A)', newCount: 5, learningCount: 2, dueCount: 10, level: 1 },
        { id: 'minna-bai11-25', name: 'Bài 11 - 25 (Sơ cấp B)', newCount: 10, learningCount: 6, dueCount: 14, level: 1 }
      ]
    },
    {
      id: 'jlptN4',
      name: 'JLPT N4 Căn bản (Từ vựng & Mẫu câu)',
      newCount: 20,
      learningCount: 12,
      dueCount: 35,
      level: 0,
      expanded: false
    },
    {
      id: 'kanjiN4',
      name: 'Kanji N4 Thường gặp (150 chữ Hán)',
      newCount: 10,
      learningCount: 4,
      dueCount: 18,
      level: 0,
      expanded: false
    },
    {
      id: 'kaiwaDaily',
      name: 'Mẫu câu Hội thoại Tình huống Hàng ngày',
      newCount: 8,
      learningCount: 3,
      dueCount: 12,
      level: 0,
      expanded: false
    }
  ];

  const [decks, setDecks] = useState<DeckNode[]>(initialDecks);

  const toggleExpand = (id: string, nodes: DeckNode[]): DeckNode[] => {
    return nodes.map((node) => {
      if (node.id === id) {
        return { ...node, expanded: !node.expanded };
      }
      if (node.children) {
        return { ...node, children: toggleExpand(id, node.children) };
      }
      return node;
    });
  };

  const handleToggle = (id: string) => {
    setDecks(toggleExpand(id, decks));
  };

  const deleteDeckNode = (id: string, nodes: DeckNode[]): DeckNode[] => {
    return nodes
      .filter((node) => node.id !== id)
      .map((node) => ({
        ...node,
        children: node.children ? deleteDeckNode(id, node.children) : undefined
      }));
  };

  const handleConfirmDelete = () => {
    if (!deckToDelete) return;
    setDecks((prev) => deleteDeckNode(deckToDelete.id, prev));
    setDeckToDelete(null);
    setMenuDeck(null);
  };

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    const newDeck: DeckNode = {
      id: `deck-${Date.now()}`,
      name: newDeckName.trim(),
      newCount: 0,
      learningCount: 0,
      dueCount: 0,
      level: 0
    };

    setDecks((prev) => [...prev, newDeck]);
    setNewDeckName('');
    setShowCreateModal(false);
  };

  const renameDeckNode = (id: string, newName: string, nodes: DeckNode[]): DeckNode[] => {
    return nodes.map((node) => {
      if (node.id === id) {
        return { ...node, name: newName };
      }
      if (node.children) {
        return { ...node, children: renameDeckNode(id, newName, node.children) };
      }
      return node;
    });
  };

  const handleConfirmRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameDeck || !renameValue.trim()) return;
    setDecks((prev) => renameDeckNode(renameDeck.id, renameValue.trim(), prev));
    setRenameDeck(null);
    setMenuDeck(null);
  };

  const renderDeckTree = (nodes: DeckNode[]) => {
    return nodes.map((node) => {
      const isSelected = selectedDeckId === node.id;
      const hasChildren = node.children && node.children.length > 0;

      return (
        <React.Fragment key={node.id}>
          <tr 
            style={{
              background: isSelected ? 'rgba(255, 232, 214, 0.45)' : 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.12s ease'
            }}
            onClick={() => setSelectedDeckId(node.id)}
          >
            {/* Deck Name and Hierarchy */}
            <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: `${16 + node.level * 22}px` }}>
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(node.id);
                  }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--ink-secondary)' }}
                >
                  {node.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <span style={{ width: '16px' }}></span>
              )}
              <span style={{ fontWeight: isSelected ? 700 : 600, fontSize: '0.95rem', color: 'var(--ink-primary)' }}>
                {node.name}
              </span>
            </td>

            {/* Counts */}
            <td style={{ textAlign: 'right', padding: '12px 16px' }}>
              <span className="chip new" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                {node.newCount}
              </span>
            </td>
            <td style={{ textAlign: 'right', padding: '12px 16px' }}>
              <span className="chip learning" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                {node.learningCount}
              </span>
            </td>
            <td style={{ textAlign: 'right', padding: '12px 16px' }}>
              <span className="chip review" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                {node.dueCount}
              </span>
            </td>

            {/* Actions Menu */}
            <td style={{ textAlign: 'center', padding: '12px 16px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuDeck(node);
                }}
                className="btn-tactile sm"
                style={{ padding: '4px 8px' }}
                title="Tùy chọn bộ thẻ"
              >
                <Settings size={14} />
              </button>
            </td>
          </tr>

          {hasChildren && node.expanded && renderDeckTree(node.children!)}
        </React.Fragment>
      );
    });
  };

  return (
    <div style={{ width: '100%', maxWidth: '880px', margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>
            🗂️ Quản lý Bộ thẻ Flashcard
          </h2>
          <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
            Cấu trúc phân cấp chuẩn Anki kết hợp hàng đợi thuật toán FSRS.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {onStudyDeck && (
            <button className="btn-tactile primary" onClick={onStudyDeck}>
              ⚡ Bắt đầu Ôn tập
            </button>
          )}
          <button className="btn-tactile" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Tạo Bộ thẻ
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="table-container" style={{ marginBottom: '20px' }}>
        <table className="tactile-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Bộ thẻ</th>
              <th style={{ textAlign: 'right', width: '12%' }}>Mới</th>
              <th style={{ textAlign: 'right', width: '12%' }}>Đang học</th>
              <th style={{ textAlign: 'right', width: '12%' }}>Cần ôn</th>
              <th style={{ textAlign: 'center', width: '14%' }}>Tùy chọn</th>
            </tr>
          </thead>
          <tbody>
            {renderDeckTree(decks)}
          </tbody>
        </table>
      </div>

      {/* Daily Review Tip */}
      <div 
        style={{
          background: 'var(--bg-surface)',
          border: 'var(--border-dark)',
          borderRadius: 'var(--radius-box)',
          boxShadow: 'var(--shadow-sm)',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.88rem',
          color: 'var(--ink-secondary)'
        }}
      >
        <span>💡 Phím tắt ôn tập FSRS: Nhấn <code>Space</code> để lật thẻ, phím <code>1</code> (Again), <code>2</code> (Hard), <code>3</code> (Good), <code>4</code> (Easy).</span>
        <span style={{ fontWeight: 700, color: 'var(--accent-pine)' }}>Tổng số thẻ: 122 thẻ</span>
      </div>

      {/* Options Dropdown Modal */}
      {menuDeck && (
        <div className="modal-backdrop" onClick={() => setMenuDeck(null)}>
          <div className="modal-box" style={{ maxWidth: '380px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 className="modal-heading">Tùy chọn: {menuDeck.name}</h3>
              <button className="btn-tactile sm" onClick={() => setMenuDeck(null)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-tactile"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => {
                  setRenameDeck(menuDeck);
                  setRenameValue(menuDeck.name);
                }}
              >
                <Edit3 size={16} color="var(--accent-cobalt)" />
                <span>Đổi tên bộ thẻ</span>
              </button>

              <button
                className="btn-tactile vermilion"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => setDeckToDelete(menuDeck)}
              >
                <Trash2 size={16} />
                <span>Xóa bộ thẻ này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameDeck && (
        <div className="modal-backdrop" onClick={() => setRenameDeck(null)}>
          <div className="modal-box" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleConfirmRename}>
              <div className="modal-head">
                <h3 className="modal-heading">Đổi tên bộ thẻ</h3>
                <button type="button" className="btn-tactile sm" onClick={() => setRenameDeck(null)}><X size={16} /></button>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Tên mới:
                </label>
                <input
                  type="text"
                  className="form-input-text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-foot">
                <button type="button" className="btn-tactile" onClick={() => setRenameDeck(null)}>Hủy</button>
                <button type="submit" className="btn-tactile primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deckToDelete && (
        <div className="modal-backdrop" onClick={() => setDeckToDelete(null)}>
          <div className="modal-box" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 className="modal-heading" style={{ color: 'var(--accent-vermilion)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} /> Xác nhận xóa
              </h3>
              <button className="btn-tactile sm" onClick={() => setDeckToDelete(null)}><X size={16} /></button>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--ink-secondary)', marginBottom: '20px' }}>
              Bạn có chắc chắn muốn xóa bộ thẻ <strong>"{deckToDelete.name}"</strong>? Thao tác này không thể hoàn tác.
            </p>
            <div className="modal-foot">
              <button className="btn-tactile" onClick={() => setDeckToDelete(null)}>Hủy</button>
              <button className="btn-tactile vermilion" onClick={handleConfirmDelete}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateDeck}>
              <div className="modal-head">
                <h3 className="modal-heading">Tạo Bộ thẻ Mới</h3>
                <button type="button" className="btn-tactile sm" onClick={() => setShowCreateModal(false)}><X size={16} /></button>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Tên bộ thẻ:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Minna no Nihongo Bài 26..."
                  className="form-input-text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-foot">
                <button type="button" className="btn-tactile" onClick={() => setShowCreateModal(false)}>Hủy</button>
                <button type="submit" className="btn-tactile primary">Tạo ngay</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
