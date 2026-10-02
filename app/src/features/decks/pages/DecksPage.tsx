import React, { useState } from 'react';
import { Settings, Trash2, Edit3, Plus, AlertTriangle, X } from 'lucide-react';

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
  const [selectedDeckId, setSelectedDeckId] = useState<string>('1-30');
  const [menuDeck, setMenuDeck] = useState<DeckNode | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<DeckNode | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newDeckName, setNewDeckName] = useState<string>('');
  const [renameDeck, setRenameDeck] = useState<DeckNode | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');

  // Initial nested decks hierarchy matching the user's screenshot
  const initialDecks: DeckNode[] = [
    {
      id: 'cuoikiN4',
      name: 'cuoikiN4',
      newCount: 0,
      learningCount: 89,
      dueCount: 200,
      level: 0,
      expanded: false
    },
    {
      id: 'cuoikiN3',
      name: 'Cuối kì N3',
      newCount: 0,
      learningCount: 2,
      dueCount: 200,
      level: 0,
      expanded: false
    },
    {
      id: 'jlptN3',
      name: 'JLPT N3',
      newCount: 13,
      learningCount: 4,
      dueCount: 12,
      level: 0,
      expanded: true,
      children: [
        {
          id: 'mimikara',
          name: 'Mimikara',
          newCount: 13,
          learningCount: 4,
          dueCount: 12,
          level: 1
        },
        {
          id: '1-30',
          name: '1-30',
          newCount: 13,
          learningCount: 4,
          dueCount: 12,
          level: 1
        }
      ]
    },
    {
      id: 'jlptN4',
      name: 'JLPT N4',
      newCount: 24,
      learningCount: 18,
      dueCount: 0,
      level: 0,
      expanded: false
    },
    {
      id: 'tncn3',
      name: 'TNCN3',
      newCount: 0,
      learningCount: 31,
      dueCount: 200,
      level: 0,
      expanded: false
    },
    {
      id: 'tncn4',
      name: 'TNCN4',
      newCount: 0,
      learningCount: 10,
      dueCount: 200,
      level: 0,
      expanded: true,
      children: [
        {
          id: 'unit10',
          name: 'Unit10',
          newCount: 124,
          learningCount: 10,
          dueCount: 76,
          level: 1,
          expanded: true,
          children: [
            { id: 'part1', name: 'Part1', newCount: 0, learningCount: 0, dueCount: 26, level: 2 },
            { id: 'part2', name: 'Part2', newCount: 0, learningCount: 0, dueCount: 50, level: 2 },
            { id: 'part3', name: 'Part3', newCount: 115, learningCount: 1, dueCount: 0, level: 2 },
            { id: 'part4', name: 'Part4', newCount: 11, learningCount: 9, dueCount: 0, level: 2 }
          ]
        },
        {
          id: 'unit9',
          name: 'Unit9',
          newCount: 0,
          learningCount: 0,
          dueCount: 200,
          level: 1,
          expanded: false
        }
      ]
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

  // Recursive deletion of a deck
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
    if (selectedDeckId === deckToDelete.id) {
      setSelectedDeckId('');
    }
    setDeckToDelete(null);
    setMenuDeck(null);
  };

  // Recursive renaming of a deck
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

  // Handle deck creation
  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    const newDeck: DeckNode = {
      id: Date.now().toString(),
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

  const renderDeckTree = (nodes: DeckNode[]) => {
    return nodes.map((node) => {
      const isSelected = selectedDeckId === node.id;
      const hasChildren = node.children && node.children.length > 0;

      return (
        <React.Fragment key={node.id}>
          <tr
            onClick={() => setSelectedDeckId(node.id)}
            style={{
              backgroundColor: isSelected ? 'var(--anki-row-selected)' : 'transparent',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'background-color 0.1s ease'
            }}
          >
            {/* Deck Name Column with Hierarchy Indent */}
            <td style={{
              padding: '8px 16px',
              paddingLeft: `${16 + node.level * 24}px`,
              fontSize: '14px',
              color: 'var(--anki-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {hasChildren ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(node.id);
                  }}
                  style={{ cursor: 'pointer', fontWeight: 'bold', width: '12px', color: 'var(--anki-text-muted)' }}
                >
                  {node.expanded ? '-' : '+'}
                </span>
              ) : (
                <span style={{ width: '12px' }}></span>
              )}
              <span>{node.name}</span>
            </td>

            {/* New Count (Blue) */}
            <td style={{
              padding: '8px 16px',
              textAlign: 'right',
              fontSize: '14px',
              fontWeight: '600',
              color: node.newCount > 0 ? 'var(--anki-blue)' : 'var(--anki-text-muted)'
            }}>
              {node.newCount}
            </td>

            {/* Learning Count (Red) */}
            <td style={{
              padding: '8px 16px',
              textAlign: 'right',
              fontSize: '14px',
              fontWeight: '600',
              color: node.learningCount > 0 ? 'var(--anki-red)' : 'var(--anki-text-muted)'
            }}>
              {node.learningCount}
            </td>

            {/* Due Count (Green) & Settings Icon */}
            <td style={{
              padding: '8px 16px',
              textAlign: 'right',
              fontSize: '14px',
              fontWeight: '600',
              color: node.dueCount > 0 ? 'var(--anki-green)' : 'var(--anki-text-muted)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                <span>{node.dueCount}</span>
                {isSelected ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuDeck(node);
                    }}
                    title="Tùy chọn bộ thẻ"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Settings size={16} color="var(--anki-blue)" />
                  </button>
                ) : (
                  <span style={{ width: '16px' }}></span>
                )}
              </div>
            </td>
          </tr>

          {/* Render Children if expanded */}
          {hasChildren && node.expanded && renderDeckTree(node.children!)}
        </React.Fragment>
      );
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
      width: '100%',
      maxWidth: '620px',
      position: 'relative'
    }}>
      {/* Central Anki Panel */}
      <div style={{
        background: 'var(--anki-panel-bg)',
        borderRadius: '12px',
        border: '1px solid var(--anki-border)',
        width: '100%',
        overflow: 'hidden',
        boxShadow: 'var(--anki-shadow)',
        padding: '16px 8px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--anki-border)', color: 'var(--anki-text)', fontSize: '14px', fontWeight: '700' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Bộ thẻ</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--anki-blue)' }}>Mới</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--anki-red)' }}>Học</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--anki-green)' }}>Đến hạn</th>
            </tr>
          </thead>
          <tbody>
            {renderDeckTree(decks)}
          </tbody>
        </table>
      </div>

      {/* Bottom Summary Text */}
      <div style={{ fontSize: '13px', color: 'var(--anki-text-muted)', textAlign: 'center' }}>
        Đã học 0 thẻ trong 0 giây hôm nay (0giây/thẻ)
      </div>

      {/* Bottom Action Buttons */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        {onStudyDeck && (
          <button
            onClick={onStudyDeck}
            className="anki-btn"
            style={{ background: 'var(--anki-blue)', color: '#ffffff', border: 'none', fontWeight: '700', padding: '6px 20px' }}
          >
            Học Thẻ Ngay
          </button>
        )}
        <button className="anki-btn">Lấy Bộ thẻ Chia sẻ</button>
        <button className="anki-btn" onClick={() => setShowCreateModal(true)}>
          <Plus size={14} /> Tạo Bộ thẻ
        </button>
        <button className="anki-btn">Nhập Tập tin</button>
      </div>

      {/* Deck Options Modal / Popover */}
      {menuDeck && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }} onClick={() => setMenuDeck(null)}>
          <div style={{
            background: 'var(--anki-panel-bg)',
            border: '1px solid var(--anki-border)',
            borderRadius: '12px',
            padding: '20px',
            width: '320px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--anki-text)' }}>
                Tùy chọn: {menuDeck.name}
              </h3>
              <button
                onClick={() => setMenuDeck(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--anki-text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <button
                onClick={() => {
                  setRenameDeck(menuDeck);
                  setRenameValue(menuDeck.name);
                }}
                className="anki-btn"
                style={{ width: '100%', justifyContent: 'flex-start', gap: '10px', padding: '10px 14px' }}
              >
                <Edit3 size={16} color="var(--anki-blue)" />
                <span>Đổi tên bộ thẻ</span>
              </button>

              <button
                onClick={() => {
                  setDeckToDelete(menuDeck);
                }}
                className="anki-btn"
                style={{ width: '100%', justifyContent: 'flex-start', gap: '10px', padding: '10px 14px', color: 'var(--anki-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <Trash2 size={16} color="var(--anki-red)" />
                <span style={{ fontWeight: '600' }}>Xóa bộ thẻ này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Deck Confirmation Modal */}
      {deckToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110
        }} onClick={() => setDeckToDelete(null)}>
          <div style={{
            background: 'var(--anki-panel-bg)',
            border: '1px solid var(--anki-border)',
            borderRadius: '12px',
            padding: '24px',
            width: '380px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--anki-red)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Xác Nhận Xóa Bộ Thẻ</h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--anki-text)', lineHeight: '1.5' }}>
              Bạn có chắc chắn muốn xóa bộ thẻ <strong style={{ color: 'var(--anki-blue)' }}>"{deckToDelete.name}"</strong> và tất cả các bộ thẻ con thuộc về nó?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => setDeckToDelete(null)}
                className="anki-btn"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="anki-btn"
                style={{ background: 'var(--anki-red)', color: '#ffffff', border: 'none', fontWeight: '700' }}
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Deck Modal */}
      {renameDeck && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110
        }} onClick={() => setRenameDeck(null)}>
          <form onSubmit={handleConfirmRename} style={{
            background: 'var(--anki-panel-bg)',
            border: '1px solid var(--anki-border)',
            borderRadius: '12px',
            padding: '24px',
            width: '360px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--anki-text)' }}>Đổi Tên Bộ Thẻ</h3>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--anki-text-muted)', display: 'block', marginBottom: '6px' }}>Tên bộ thẻ mới</label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
                autoFocus
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRenameDeck(null)}
                className="anki-btn"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="anki-btn"
                style={{ background: 'var(--anki-blue)', color: '#ffffff', border: 'none', fontWeight: '700' }}
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create New Deck Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110
        }} onClick={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateDeck} style={{
            background: 'var(--anki-panel-bg)',
            border: '1px solid var(--anki-border)',
            borderRadius: '12px',
            padding: '24px',
            width: '360px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--anki-text)' }}>Tạo Bộ Thẻ Mới</h3>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--anki-text-muted)', display: 'block', marginBottom: '6px' }}>Tên bộ thẻ</label>
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="Ví dụ: Từ vựng N4 Bài 1"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
                autoFocus
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="anki-btn"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="anki-btn"
                style={{ background: 'var(--anki-blue)', color: '#ffffff', border: 'none', fontWeight: '700' }}
              >
                Tạo Mới
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

