import React, { useState } from 'react';
import { Settings } from 'lucide-react';

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

  const renderDeckTree = (nodes: DeckNode[]) => {
    return nodes.map((node) => {
      const isSelected = selectedDeckId === node.id;
      const hasChildren = node.children && node.children.length > 0;

      return (
        <React.Fragment key={node.id}>
          <tr
            onClick={() => setSelectedDeckId(node.id)}
            style={{
              backgroundColor: isSelected ? '#34373d' : 'transparent',
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
              color: '#ffffff',
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
                  style={{ cursor: 'pointer', fontWeight: 'bold', width: '12px', color: '#aaaaaa' }}
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
              color: node.newCount > 0 ? '#0099ff' : '#666666'
            }}>
              {node.newCount}
            </td>

            {/* Learning Count (Red) */}
            <td style={{
              padding: '8px 16px',
              textAlign: 'right',
              fontSize: '14px',
              fontWeight: '600',
              color: node.learningCount > 0 ? '#ff4d4d' : '#666666'
            }}>
              {node.learningCount}
            </td>

            {/* Due Count (Green) */}
            <td style={{
              padding: '8px 16px',
              textAlign: 'right',
              fontSize: '14px',
              fontWeight: '600',
              color: node.dueCount > 0 ? '#2ecc71' : '#666666'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                <span>{node.dueCount}</span>
                {isSelected ? (
                  <Settings size={15} color="#aaaaaa" style={{ cursor: 'pointer' }} />
                ) : (
                  <span style={{ width: '15px' }}></span>
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
      maxWidth: '620px'
    }}>
      {/* Central Anki Panel */}
      <div style={{
        background: '#1f1f1f',
        borderRadius: '12px',
        border: '1px solid #333333',
        width: '100%',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        padding: '16px 8px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333333', color: '#ffffff', fontSize: '14px', fontWeight: '700' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Bộ thẻ</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: '#0099ff' }}>Mới</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: '#ff4d4d' }}>Học</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: '#2ecc71' }}>Đến hạn</th>
            </tr>
          </thead>
          <tbody>
            {renderDeckTree(decks)}
          </tbody>
        </table>
      </div>

      {/* Bottom Summary Text */}
      <div style={{ fontSize: '13px', color: '#dddddd', textAlign: 'center' }}>
        Đã học 0 thẻ trong 0 giây hôm nay (0giây/thẻ)
      </div>

      {/* Bottom Action Buttons */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        {onStudyDeck && (
          <button
            onClick={onStudyDeck}
            className="anki-btn"
            style={{ background: '#0099ff', color: '#ffffff', border: 'none', fontWeight: '700', padding: '6px 20px' }}
          >
            Học Thẻ Ngay
          </button>
        )}
        <button className="anki-btn">Lấy Bộ thẻ Chia sẻ</button>
        <button className="anki-btn">Tạo Bộ thẻ</button>
        <button className="anki-btn">Nhập Tập tin</button>
      </div>
    </div>
  );
};
