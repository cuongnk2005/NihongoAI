import React, { useState, useRef } from 'react';
import { 
  Settings, Trash2, Edit3, Plus, AlertTriangle, X, ChevronRight, ChevronDown, 
  GripVertical, Folder, ArrowUpRight, Play, BookOpen, RefreshCw, Upload, Copy
} from 'lucide-react';
import { Flashcard, CardType } from '../../../types';
import { CsvImportModal, DeckOption, CsvImportResult, buildAiCsvPrompt } from '../components/CsvImportModal';
import { useSavedDecks } from '../useSavedDecks';

export interface DeckNode {
  id: string;
  name: string;
  newCount?: number;
  learningCount?: number;
  dueCount?: number;
  level: number;
  expanded?: boolean;
  children?: DeckNode[];
  cards?: Flashcard[];
}

export interface DecksPageProps {
  onStudyDeck?: (deck: { id: string; name: string; cards: Flashcard[] }) => void;
}

export const initialDecks: DeckNode[] = [
  {
    id: 'minna',
    name: 'Minna no Nihongo (Bài 1 - 25)',
    level: 0,
    expanded: true,
    children: [
      {
        id: 'minna-bai1-10',
        name: 'Bài 1 - 10 (Sơ cấp A)',
        level: 1,
        cards: [
          {
            id: 101,
            word: '食べる',
            reading: 'たべる • taberu',
            meaningVi: 'ăn (dùng bữa, dùng cơm)',
            partOfSpeech: 'Động từ nhóm 2',
            jlptLevel: 'N5',
            exampleSentenceJa: '毎朝、パンと卵を食べます。',
            exampleSentenceVi: 'Mỗi sáng tôi đều ăn bánh mì và trứng.',
            reps: 0
          },
          {
            id: 102,
            word: '見る',
            reading: 'みる • miru',
            meaningVi: 'nhìn, xem, ngắm',
            partOfSpeech: 'Động từ nhóm 2',
            jlptLevel: 'N5',
            exampleSentenceJa: '昨日、友達と映画を見ました。',
            exampleSentenceVi: 'Hôm qua tôi đã xem phim với bạn bè.',
            intervalDays: 1,
            reps: 2
          },
          {
            id: 103,
            word: '行く',
            reading: 'いく • iku',
            meaningVi: 'đi (di chuyển đến đâu đó)',
            partOfSpeech: 'Động từ nhóm 1',
            jlptLevel: 'N5',
            exampleSentenceJa: '明日、東京へ行きます。',
            exampleSentenceVi: 'Ngày mai tôi sẽ đi Tokyo.',
            intervalDays: 4,
            reps: 5
          },
          {
            id: 104,
            word: '友達',
            reading: 'ともだち • tomodachi',
            meaningVi: 'bạn bè, bạn thân',
            partOfSpeech: 'Danh từ',
            jlptLevel: 'N5',
            exampleSentenceJa: '友達と京都を旅行しました。',
            exampleSentenceVi: 'Tôi đã đi du lịch Kyoto cùng bạn bè.',
            intervalDays: 6,
            reps: 8
          },
          {
            id: 105,
            word: '本',
            reading: 'ほん • hon',
            meaningVi: 'sách vở, tài liệu',
            partOfSpeech: 'Danh từ',
            jlptLevel: 'N5',
            exampleSentenceJa: '図書館で日本語の本を借りました。',
            exampleSentenceVi: 'Tôi đã mượn sách tiếng Nhật ở thư viện.',
            intervalDays: 8,
            reps: 9
          }
        ]
      },
      {
        id: 'minna-bai11-25',
        name: 'Bài 11 - 25 (Sơ cấp B)',
        level: 1,
        cards: [
          {
            id: 106,
            word: '～たことがある',
            reading: '～たことがある',
            meaningVi: 'đã từng làm gì đó (biểu thị kinh nghiệm)',
            partOfSpeech: 'Mẫu ngữ pháp',
            jlptLevel: 'N4',
            exampleSentenceJa: '日本へ行ったことがありますか。',
            exampleSentenceVi: 'Bạn đã từng đi Nhật Bản bao giờ chưa?',
            reps: 0
          },
          {
            id: 107,
            word: '約束',
            reading: 'やくそく • yakusoku',
            meaningVi: 'lời hứa, cuộc hẹn',
            partOfSpeech: 'Danh từ',
            jlptLevel: 'N4',
            exampleSentenceJa: '友達と約束があります。',
            exampleSentenceVi: 'Tôi có một cuộc hẹn với bạn bè.',
            intervalDays: 1,
            reps: 3
          },
          {
            id: 108,
            word: '教える',
            reading: 'おしえる • oshieru',
            meaningVi: 'dạy dỗ, chỉ dẫn, cho biết',
            partOfSpeech: 'Động từ nhóm 2',
            jlptLevel: 'N5',
            exampleSentenceJa: '先生が日本語を教えてくれました。',
            exampleSentenceVi: 'Thầy giáo đã dạy tiếng Nhật cho tôi.',
            intervalDays: 5,
            reps: 7
          },
          {
            id: 109,
            word: '勉強する',
            reading: 'べんきょうする • benkyousuru',
            meaningVi: 'học tập, nghiên cứu',
            partOfSpeech: 'Động từ nhóm 3',
            jlptLevel: 'N5',
            exampleSentenceJa: '毎日3時間日本語を勉強します。',
            exampleSentenceVi: 'Mỗi ngày tôi học tiếng Nhật 3 tiếng.',
            intervalDays: 7,
            reps: 8
          }
        ]
      }
    ]
  },
  {
    id: 'jlptN4',
    name: 'JLPT N4 Căn bản (Từ vựng & Mẫu câu)',
    level: 0,
    expanded: false,
    cards: [
      {
        id: 201,
        word: '美しい',
        reading: 'うつくしい • utsukushii',
        meaningVi: 'đẹp đẽ, tuyệt mỹ, thanh khiết',
        partOfSpeech: 'Tính từ đuôi い',
        jlptLevel: 'N4',
        exampleSentenceJa: '富士山の夕焼けは本当に美しいです。',
        exampleSentenceVi: 'Hoàng hôn trên núi Phú Sĩ thực sự rất đẹp.',
        intervalDays: 7,
        reps: 8
      },
      {
        id: 202,
        word: '案内する',
        reading: 'あんないする • annaisuru',
        meaningVi: 'hướng dẫn, dẫn đường',
        partOfSpeech: 'Động từ nhóm 3',
        jlptLevel: 'N4',
        exampleSentenceJa: '京都の有名な観光地をご案内します。',
        exampleSentenceVi: 'Tôi sẽ dẫn bạn tham quan các địa điểm nổi tiếng ở Kyoto.',
        reps: 0
      },
      {
        id: 203,
        word: '間に合う',
        reading: 'まにあう • maniau',
        meaningVi: 'kịp giờ, kịp thời gian',
        partOfSpeech: 'Động từ nhóm 1',
        jlptLevel: 'N4',
        exampleSentenceJa: '電車の発車時間になんとか間に合いました。',
        exampleSentenceVi: 'Tôi vừa kịp giờ chuyến tàu khởi hành.',
        intervalDays: 2,
        reps: 4
      },
      {
        id: 204,
        word: '～つもりです',
        reading: '～つもりです',
        meaningVi: 'dự định làm gì (ý chí cá nhân)',
        partOfSpeech: 'Mẫu ngữ pháp',
        jlptLevel: 'N4',
        exampleSentenceJa: '来年、日本へ留学するつもりです。',
        exampleSentenceVi: 'Năm sau tôi dự định sẽ đi du học Nhật Bản.',
        intervalDays: 4,
        reps: 6
      }
    ]
  },
  {
    id: 'kanjiN4',
    name: 'Kanji N4 Thường gặp (150 chữ Hán)',
    level: 0,
    expanded: false,
    cards: [
      {
        id: 301,
        word: '新聞',
        reading: 'しんぶん • shinbun (Tân Văn)',
        meaningVi: 'tờ báo, báo chí',
        partOfSpeech: 'Danh từ',
        jlptLevel: 'N4',
        exampleSentenceJa: '毎朝、コーヒーを飲みながら新聞を読みます。',
        exampleSentenceVi: 'Mỗi sáng tôi vừa uống cà phê vừa đọc báo.',
        reps: 0
      },
      {
        id: 302,
        word: '計画',
        reading: 'けいかく • keikaku (Kế Họa)',
        meaningVi: 'kế hoạch, dự tính',
        partOfSpeech: 'Danh từ',
        jlptLevel: 'N4',
        exampleSentenceJa: '夏休みの旅行計画を友達と一緒に立てましょう。',
        exampleSentenceVi: 'Hãy cùng bạn bè lập kế hoạch du lịch cho kỳ nghỉ hè nhé.',
        intervalDays: 2,
        reps: 3
      },
      {
        id: 303,
        word: '注意',
        reading: 'ちゅうい • chuui (Chú Ý)',
        meaningVi: 'chú ý, để ý, nhắc nhở',
        partOfSpeech: 'Danh từ / Động từ nhóm 3',
        jlptLevel: 'N4',
        exampleSentenceJa: '車に注意して道を渡ってください。',
        exampleSentenceVi: 'Hãy chú ý xe cộ khi băng qua đường.',
        intervalDays: 5,
        reps: 7
      }
    ]
  },
  {
    id: 'kaiwaDaily',
    name: 'Mẫu câu Hội thoại Tình huống Hàng ngày',
    level: 0,
    expanded: false,
    cards: [
      {
        id: 401,
        word: 'こんにちは',
        reading: 'こんにちは • konnichiwa',
        meaningVi: 'chào buổi trưa / chào ban ngày',
        partOfSpeech: 'Chào hỏi',
        jlptLevel: 'N5',
        exampleSentenceJa: '皆さん、こんにちは。今日も頑張りましょう。',
        exampleSentenceVi: 'Chào mọi người. Hôm nay chúng ta cùng cố gắng nhé.',
        reps: 0
      },
      {
        id: 402,
        word: 'お疲れ様でした',
        reading: 'おつかれさまでした • otsukaresamadeshita',
        meaningVi: 'anh/chị đã vất vả rồi (lời chào kết thúc công việc)',
        partOfSpeech: 'Chào hỏi công sở',
        jlptLevel: 'N4',
        exampleSentenceJa: '今日のミーティングはお疲れ様でした。',
        exampleSentenceVi: 'Cuộc họp hôm nay anh/chị đã vất vả rồi.',
        intervalDays: 1,
        reps: 2
      },
      {
        id: 403,
        word: 'よろしくお願いします',
        reading: 'よろしくおねがいします • yoroshiku onegaishimasu',
        meaningVi: 'rất mong được giúp đỡ / kính mong sự hợp tác',
        partOfSpeech: 'Lời chào trang trọng',
        jlptLevel: 'N4',
        exampleSentenceJa: '新しいプロジェクトでもどうぞよろしくお願いします。',
        exampleSentenceVi: 'Trong dự án mới, kính mong mọi người giúp đỡ.',
        intervalDays: 6,
        reps: 7
      }
    ]
  }
];

export const collectAllCards = (node: DeckNode): Flashcard[] => {
  const ownCards = (node.cards || []).map((c) => ({
    ...c,
    deckId: node.id,
    deckName: node.name
  }));
  const childrenCards = (node.children || []).flatMap(collectAllCards);
  return [...ownCards, ...childrenCards];
};

export const getAggregatedCounts = (node: DeckNode): { newCount: number; learningCount: number; dueCount: number; totalCards: number } => {
  const cards = node.cards || [];
  let newTotal = 0;
  let learningTotal = 0;
  let dueTotal = 0;

  for (const c of cards) {
    if (!c.reps || c.reps === 0) newTotal++;
    else if ((c.intervalDays || 0) <= 2) learningTotal++;
    else dueTotal++;
  }

  if (cards.length === 0) {
    newTotal = node.newCount || 0;
    learningTotal = node.learningCount || 0;
    dueTotal = node.dueCount || 0;
  }

  let totalCards = cards.length;

  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      const childCounts = getAggregatedCounts(child);
      newTotal += childCounts.newCount;
      learningTotal += childCounts.learningCount;
      dueTotal += childCounts.dueCount;
      totalCards += childCounts.totalCards;
    }
  }

  return { newCount: newTotal, learningCount: learningTotal, dueCount: dueTotal, totalCards };
};

const findDeckById = (id: string, nodes: DeckNode[]): DeckNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findDeckById(id, node.children);
      if (found) return found;
    }
  }
  return null;
};

const isDescendant = (parentId: string, searchId: string, nodes: DeckNode[]): boolean => {
  const parentNode = findDeckById(parentId, nodes);
  if (!parentNode || !parentNode.children) return false;

  const check = (children: DeckNode[]): boolean => {
    for (const child of children) {
      if (child.id === searchId) return true;
      if (child.children && check(child.children)) return true;
    }
    return false;
  };
  return check(parentNode.children);
};

const isValidDropTarget = (draggedId: string, targetId: string, nodes: DeckNode[]): boolean => {
  if (draggedId === targetId) return false;
  if (isDescendant(draggedId, targetId, nodes)) return false;
  return true;
};

const moveDeckNode = (draggedId: string, targetParentId: string | null, tree: DeckNode[]): DeckNode[] => {
  let draggedNode: DeckNode | null = null;

  const removeRecursive = (list: DeckNode[]): DeckNode[] => {
    const nextList: DeckNode[] = [];
    for (const item of list) {
      if (item.id === draggedId) {
        draggedNode = { ...item };
      } else {
        const copy = { ...item };
        if (copy.children && copy.children.length > 0) {
          copy.children = removeRecursive(copy.children);
        }
        nextList.push(copy);
      }
    }
    return nextList;
  };

  let cleanTree = removeRecursive(tree);
  if (!draggedNode) return tree;

  if (targetParentId === null) {
    cleanTree.push(draggedNode);
  } else {
    const insertRecursive = (list: DeckNode[]): DeckNode[] => {
      return list.map((item) => {
        if (item.id === targetParentId) {
          const children = item.children ? [...item.children, draggedNode!] : [draggedNode!];
          return {
            ...item,
            expanded: true,
            children
          };
        }
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: insertRecursive(item.children)
          };
        }
        return item;
      });
    };
    cleanTree = insertRecursive(cleanTree);
  }

  const setLevels = (list: DeckNode[], currentLevel: number): DeckNode[] => {
    return list.map((item) => ({
      ...item,
      level: currentLevel,
      children: item.children && item.children.length > 0 ? setLevels(item.children, currentLevel + 1) : undefined
    }));
  };

  return setLevels(cleanTree, 0);
};

export const DecksPage: React.FC<DecksPageProps> = ({ onStudyDeck }) => {
  const [selectedDeckId, setSelectedDeckId] = useState<string>('minna');
  const [menuDeck, setMenuDeck] = useState<DeckNode | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<DeckNode | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newDeckName, setNewDeckName] = useState<string>('');
  const [renameDeck, setRenameDeck] = useState<DeckNode | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');

  const [draggedDeckId, setDraggedDeckId] = useState<string | null>(null);
  const [dragOverDeckId, setDragOverDeckId] = useState<string | null>(null);

  const { decks, setDecks, loaded, saving, error: storageError, retry: retryStorage, backup } = useSavedDecks(initialDecks);

  // Add Card State
  const [deckForAddCard, setDeckForAddCard] = useState<DeckNode | null>(null);
  const [selectedCardType, setSelectedCardType] = useState<CardType>('typing_2way');

  // CSV Import State
  const [deckIdForCsvImport, setDeckIdForCsvImport] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  
  // Vocab / Typing_2way fields
  const [vocabWord, setVocabWord] = useState<string>('');
  const [vocabReading, setVocabReading] = useState<string>('');
  const [vocabMeaning, setVocabMeaning] = useState<string>('');
  const [vocabSinoVi, setVocabSinoVi] = useState<string>('');
  const [vocabPos] = useState<string>('Từ vựng');
  const [vocabLevel] = useState<string>('N4');
  const [vocabExJa, setVocabExJa] = useState<string>('');
  const [vocabExVi, setVocabExVi] = useState<string>('');

  // Basic fields
  const [basicFront, setBasicFront] = useState<string>('');
  const [basicBack, setBasicBack] = useState<string>('');

  // Reversed fields
  const [revFront, setRevFront] = useState<string>('');
  const [revBack, setRevBack] = useState<string>('');
  const [revReading, setRevReading] = useState<string>('');

  // Cloze fields
  const [clozeSentence, setClozeSentence] = useState<string>('');
  const [clozeHint, setClozeHint] = useState<string>('');
  const [clozeMeaning, setClozeMeaning] = useState<string>('');
  const clozeTextareaRef = useRef<HTMLTextAreaElement>(null);

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
      level: 0,
      cards: []
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

  const handleStartStudy = (deckToStudy?: DeckNode) => {
    if (!onStudyDeck) return;
    const target = deckToStudy || findDeckById(selectedDeckId, decks) || decks[0];
    if (target) {
      const allCards = collectAllCards(target);
      onStudyDeck({
        id: target.id,
        name: target.name,
        cards: allCards
      });
    }
  };

  // Insert Cloze syntax into textarea
  const handleInsertCloze = () => {
    const textarea = clozeTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = clozeSentence.substring(start, end);
    const replacement = `{{c1::${selected || 'từ cần điền'}}}`;
    const newText = clozeSentence.substring(0, start) + replacement + clozeSentence.substring(end);
    setClozeSentence(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 6, start + 6 + (selected || 'từ cần điền').length);
    }, 50);
  };

  // Save new card to deck
  const handleSaveCard = (andContinue: boolean = false) => {
    if (!deckForAddCard) return;

    const cardsToInsert: Flashcard[] = [];
    const timestamp = Date.now();

    if (selectedCardType === 'typing_2way') {
      if (!vocabWord.trim() || !vocabReading.trim() || !vocabMeaning.trim()) return;
      // Card 1: Mặt trước Kanji + ô nhập kiểm tra Hiragana -> Mặt sau hiển thị tất cả các trường
      cardsToInsert.push({
        id: timestamp,
        word: vocabWord.trim(),
        reading: vocabReading.trim(),
        meaningVi: vocabMeaning.trim(),
        sinoVietnamese: vocabSinoVi.trim() || undefined,
        partOfSpeech: vocabPos,
        jlptLevel: vocabLevel,
        exampleSentenceJa: vocabExJa.trim() || undefined,
        exampleSentenceVi: vocabExVi.trim() || undefined,
        cardType: 'typing_2way',
        typingDirection: 'kanji_to_reading',
        reps: 0
      });
      // Card 2: Mặt trước Nghĩa tiếng Việt + ô nhập kiểm tra từ tiếng Nhật -> Mặt sau hiển thị tất cả các trường
      cardsToInsert.push({
        id: timestamp + 1,
        word: vocabWord.trim(),
        reading: vocabReading.trim(),
        meaningVi: vocabMeaning.trim(),
        sinoVietnamese: vocabSinoVi.trim() || undefined,
        partOfSpeech: vocabPos,
        jlptLevel: vocabLevel,
        exampleSentenceJa: vocabExJa.trim() || undefined,
        exampleSentenceVi: vocabExVi.trim() || undefined,
        cardType: 'typing_2way',
        typingDirection: 'meaning_to_ja',
        reps: 0
      });
    } else if (selectedCardType === 'vocab') {
      if (!vocabWord.trim() || !vocabMeaning.trim()) return;
      cardsToInsert.push({
        id: timestamp,
        word: vocabWord.trim(),
        reading: vocabReading.trim() || vocabWord.trim(),
        meaningVi: vocabMeaning.trim(),
        sinoVietnamese: vocabSinoVi.trim() || undefined,
        partOfSpeech: vocabPos,
        jlptLevel: vocabLevel,
        exampleSentenceJa: vocabExJa.trim() || undefined,
        exampleSentenceVi: vocabExVi.trim() || undefined,
        cardType: 'vocab',
        reps: 0
      });
    } else if (selectedCardType === 'basic') {
      if (!basicFront.trim() || !basicBack.trim()) return;
      cardsToInsert.push({
        id: timestamp,
        word: basicFront.trim(),
        meaningVi: basicBack.trim(),
        frontContent: basicFront.trim(),
        backContent: basicBack.trim(),
        cardType: 'basic',
        reps: 0
      });
    } else if (selectedCardType === 'reversed') {
      if (!revFront.trim() || !revBack.trim()) return;
      // Thẻ 1: Thuận (Front -> Back)
      cardsToInsert.push({
        id: timestamp,
        word: revFront.trim(),
        reading: revReading.trim() || undefined,
        meaningVi: revBack.trim(),
        frontContent: revFront.trim(),
        backContent: revReading.trim() ? `${revBack.trim()} • Cách đọc: ${revReading.trim()}` : revBack.trim(),
        cardType: 'reversed',
        reps: 0
      });
      // Thẻ 2: Đảo (Back -> Front)
      cardsToInsert.push({
        id: timestamp + 1,
        word: revBack.trim(),
        reading: revReading.trim() || undefined,
        meaningVi: revFront.trim(),
        frontContent: `[Nghĩa tiếng Việt] ${revBack.trim()}`,
        backContent: revReading.trim() ? `${revFront.trim()} (${revReading.trim()})` : revFront.trim(),
        cardType: 'reversed',
        reps: 0
      });
    } else if (selectedCardType === 'cloze') {
      if (!clozeSentence.trim()) return;
      cardsToInsert.push({
        id: timestamp,
        word: clozeSentence.trim(),
        meaningVi: clozeMeaning.trim() || 'Điền từ thích hợp vào chỗ trống',
        frontContent: clozeSentence.trim(),
        backContent: clozeMeaning.trim() || undefined,
        clozeHint: clozeHint.trim() || undefined,
        cardType: 'cloze',
        reps: 0
      });
    }

    if (cardsToInsert.length === 0) return;

    // Append to target deck's cards
    const addRecursive = (nodes: DeckNode[]): DeckNode[] => {
      return nodes.map((node) => {
        if (node.id === deckForAddCard.id) {
          const currentCards = node.cards || [];
          return {
            ...node,
            cards: [...currentCards, ...cardsToInsert]
          };
        }
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: addRecursive(node.children)
          };
        }
        return node;
      });
    };

    setDecks((prev) => addRecursive(prev));

    if (andContinue) {
      // Clear fields for fast input of next card
      setVocabWord('');
      setVocabReading('');
      setVocabMeaning('');
      setVocabSinoVi('');
      setVocabExJa('');
      setVocabExVi('');
      setBasicFront('');
      setBasicBack('');
      setRevFront('');
      setRevBack('');
      setRevReading('');
      setClozeSentence('');
      setClozeHint('');
      setClozeMeaning('');
    } else {
      setDeckForAddCard(null);
    }
  };

  // Flatten deck tree into options for CSV Import modal
  const flattenDeckOptions = (nodes: DeckNode[]): DeckOption[] => {
    const list: DeckOption[] = [];
    for (const node of nodes) {
      list.push({ id: node.id, name: node.name, level: node.level });
      if (node.children && node.children.length > 0) {
        list.push(...flattenDeckOptions(node.children));
      }
    }
    return list;
  };

  const buildExistingCardsMap = (nodes: DeckNode[]): Record<string, Flashcard[]> => {
    const map: Record<string, Flashcard[]> = {};
    const traverse = (list: DeckNode[]) => {
      for (const n of list) {
        map[n.id] = n.cards || [];
        if (n.children) traverse(n.children);
      }
    };
    traverse(nodes);
    return map;
  };

  const handleConfirmCsvImport = (result: CsvImportResult) => {
    const updateDeckCards = (nodes: DeckNode[]): DeckNode[] => {
      return nodes.map((node) => {
        if (node.id === result.targetDeckId) {
          let updatedCards = [...(node.cards || [])];
          if (result.cardsToUpdate.length > 0) {
            const updateMap = new Map(result.cardsToUpdate.map((c) => [c.id, c]));
            updatedCards = updatedCards.map((c) => updateMap.get(c.id) || c);
          }
          updatedCards.push(...result.cardsToInsert);
          return {
            ...node,
            cards: updatedCards
          };
        }
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: updateDeckCards(node.children)
          };
        }
        return node;
      });
    };

    const targetNode = findDeckById(result.targetDeckId, decks);
    setDecks((prev) => updateDeckCards(prev));
    setSelectedDeckId(result.targetDeckId);
    setDeckIdForCsvImport(null);

    const parts: string[] = [];
    if (result.importedCount > 0) parts.push(`thêm mới ${result.importedCount} thẻ`);
    if (result.updatedCount > 0) parts.push(`cập nhật ${result.updatedCount} thẻ`);
    if (result.skippedCount > 0) parts.push(`bỏ qua ${result.skippedCount} dòng trùng/lỗi`);

    setImportSuccessMsg(
      `Đã nhập CSV vào bộ "${targetNode?.name || ''}": ${parts.join(', ')}.`
    );
  };

  const selectedDeck = findDeckById(selectedDeckId, decks) || decks[0];
  const selectedCounts = selectedDeck ? getAggregatedCounts(selectedDeck) : null;
  const isDraggingNestedDeck = draggedDeckId ? (findDeckById(draggedDeckId, decks)?.level || 0) > 0 : false;

  const renderDeckTree = (nodes: DeckNode[]) => {
    return nodes.map((node) => {
      const isSelected = selectedDeckId === node.id;
      const hasChildren = node.children && node.children.length > 0;
      const counts = getAggregatedCounts(node);
      const isDropTarget = dragOverDeckId === node.id;
      const isDragging = draggedDeckId === node.id;

      return (
        <React.Fragment key={node.id}>
          <tr
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', node.id);
              setDraggedDeckId(node.id);
            }}
            onDragEnd={() => {
              setDraggedDeckId(null);
              setDragOverDeckId(null);
            }}
            onDragOver={(e) => {
              if (draggedDeckId && isValidDropTarget(draggedDeckId, node.id, decks)) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverDeckId !== node.id) {
                  setDragOverDeckId(node.id);
                }
              }
            }}
            onDragLeave={() => {
              if (dragOverDeckId === node.id) {
                setDragOverDeckId(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedDeckId && isValidDropTarget(draggedDeckId, node.id, decks)) {
                setDecks((prev) => moveDeckNode(draggedDeckId, node.id, prev));
              }
              setDraggedDeckId(null);
              setDragOverDeckId(null);
            }}
            className={`${isSelected ? 'selected-deck-row' : ''} ${isDropTarget ? 'drop-target-row' : ''} ${isDragging ? 'dragging-row' : ''}`}
            style={{
              cursor: 'pointer',
              transition: 'background-color 0.12s ease',
              opacity: isDragging ? 0.35 : 1
            }}
            onClick={() => setSelectedDeckId(node.id)}
            onDoubleClick={() => handleStartStudy(node)}
            title="Nhấp để chọn, kéo thả để lồng vào bộ thẻ khác, nhấp đúp để ôn tập"
          >
            {/* Deck Name and Hierarchy */}
            <td style={{ padding: '12px 16px', paddingLeft: `${16 + node.level * 24}px` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Drag Grip */}
                <span title="Kéo để thả vào bộ thẻ khác" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <GripVertical size={15} className="drag-handle" />
                </span>

                {/* Expand / Collapse or Spacer */}
                {hasChildren ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(node.id);
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--ink-secondary)', padding: 0 }}
                    title={node.expanded ? 'Thu gọn' : 'Mở rộng'}
                  >
                    {node.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                ) : (
                  <span style={{ width: '16px', display: 'inline-block' }}></span>
                )}

                {/* Folder icon */}
                <Folder size={16} color={node.level === 0 ? 'var(--accent-pine)' : 'var(--ink-secondary)'} />

                {/* Deck Name */}
                <span style={{ fontWeight: isSelected ? 700 : 600, fontSize: '0.95rem', color: 'var(--ink-primary)' }}>
                  {node.name}
                </span>

                {/* Has Children badge */}
                {hasChildren && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)', fontWeight: 500 }}>
                    ({node.children!.length} bộ con)
                  </span>
                )}

                {/* Drop indicator prompt */}
                {isDropTarget && (
                  <span className="meta-pill" style={{ background: 'var(--accent-pine)', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                    ↳ Thả vào để làm bộ thẻ con
                  </span>
                )}
              </div>
            </td>

            {/* Counts */}
            <td style={{ textAlign: 'center', padding: '12px 16px' }}>
              <span className="chip deck-count-chip new">
                {counts.newCount}
              </span>
            </td>
            <td style={{ textAlign: 'center', padding: '12px 16px' }}>
              <span className="chip deck-count-chip learning">
                {counts.learningCount}
              </span>
            </td>
            <td style={{ textAlign: 'center', padding: '12px 16px' }}>
              <span className="chip deck-count-chip review">
                {counts.dueCount}
              </span>
            </td>

            {/* Actions Menu */}
            <td style={{ textAlign: 'center', padding: '12px 16px' }}>
              <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeckForAddCard(node);
                  }}
                  className="btn-tactile sm"
                  style={{ padding: '4px 8px' }}
                  title="Thêm thẻ học vào bộ này (Add Card)"
                >
                  <Plus size={13} color="var(--accent-pine)" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartStudy(node);
                  }}
                  className="btn-tactile sm"
                  style={{ padding: '4px 8px' }}
                  title="Ôn tập bộ thẻ này"
                >
                  <Play size={13} color="var(--accent-pine)" />
                </button>
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
              </div>
            </td>
          </tr>

          {hasChildren && node.expanded && renderDeckTree(node.children!)}
        </React.Fragment>
      );
    });
  };

  if (!loaded) return <div role="status" style={{ padding: 24 }}>
    <p>{storageError || 'Đang khôi phục bộ thẻ đã lưu…'}</p>
    {storageError && <button className="btn-tactile" onClick={retryStorage}>Thử lại</button>}
  </div>;

  return (
    <div style={{ width: '100%', maxWidth: '940px', margin: '0 auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <small role="status">{saving ? 'Đang lưu bộ thẻ…' : storageError ? 'Bộ thẻ chưa được lưu' : 'Bộ thẻ đã lưu trên trình duyệt này'}</small>
        <button className="btn-tactile sm" onClick={backup}>Tải bản sao lưu</button>
      </div>
      {storageError && <div role="alert" style={{ marginBottom: 16, color: 'var(--accent-vermilion)' }}>
        <p>{storageError}</p><button className="btn-tactile sm" onClick={retryStorage}>Thử lưu lại</button>
      </div>}
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-grotesk)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '4px' }}>
            🗂️ Quản lý Bộ thẻ Flashcard
          </h2>
          <p style={{ color: 'var(--ink-secondary)', fontSize: '0.9rem' }}>
            Hỗ trợ kéo thả tạo bộ thẻ con và thêm thẻ học nhiều định dạng (Cơ bản, Hai chiều, Điền từ, Từ vựng).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {onStudyDeck && (
            <button className="btn-tactile primary" onClick={() => handleStartStudy()} title="Ôn tập bộ thẻ đang được chọn">
              ⚡ Bắt đầu Ôn tập ({selectedCounts?.totalCards || 0} thẻ)
            </button>
          )}
          <button className="btn-tactile" onClick={() => setDeckForAddCard(selectedDeck)} title="Thêm thẻ mới vào bộ thẻ đang chọn">
            <Plus size={16} /> Thêm Thẻ Mới
          </button>
          <button
            className="btn-tactile"
            onClick={() => setDeckIdForCsvImport(selectedDeck?.id || decks[0]?.id || 'minna')}
            title="Nhập hàng loạt thẻ từ file CSV / TSV của Anki hoặc Excel"
          >
            <Upload size={15} color="var(--accent-pine)" /> Nhập CSV
          </button>
          <button className="btn-tactile" onClick={() => setShowCreateModal(true)}>
            <Folder size={16} /> Tạo Bộ thẻ
          </button>
        </div>
      </div>

      {/* CSV Import Success Notification Banner */}
      {importSuccessMsg && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            marginBottom: '16px',
            background: '#F0FDF4',
            border: '1.5px solid var(--accent-pine)',
            borderRadius: 'var(--radius-box)',
            color: 'var(--accent-pine)',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          <span>✅ {importSuccessMsg}</span>
          <button
            type="button"
            onClick={() => setImportSuccessMsg(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-pine)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Drop Zone to Unnest (shown while dragging a subdeck) */}
      {isDraggingNestedDeck && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedDeckId) {
              setDecks((prev) => moveDeckNode(draggedDeckId, null, prev));
            }
            setDraggedDeckId(null);
            setDragOverDeckId(null);
          }}
          style={{
            border: '2px dashed var(--accent-vermilion)',
            borderRadius: 'var(--radius-box)',
            padding: '14px 20px',
            textAlign: 'center',
            background: 'rgba(193, 73, 83, 0.08)',
            marginBottom: '16px',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: 'var(--accent-vermilion)',
            cursor: 'copy'
          }}
        >
          📥 Thả vào đây để đưa ra ngoài làm Bộ thẻ gốc (Cấp 0)
        </div>
      )}

      {/* Main Table Card */}
      <div className="table-container" style={{ marginBottom: '20px' }}>
        <table className="tactile-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Bộ thẻ</th>
              <th style={{ textAlign: 'center', width: '12%' }}>Mới</th>
              <th style={{ textAlign: 'center', width: '12%' }}>Đang học</th>
              <th style={{ textAlign: 'center', width: '12%' }}>Cần ôn</th>
              <th style={{ textAlign: 'center', width: '14%' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>{renderDeckTree(decks)}</tbody>
        </table>
      </div>

      {/* Selection & Aggregation Tip Bar */}
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
          color: 'var(--ink-secondary)',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <span>
          💡 Đang chọn: <strong>{selectedDeck?.name}</strong> ({selectedCounts?.totalCards || 0} thẻ tổng hợp). Nhấp đúp vào dòng để ôn tập ngay.
        </span>
        <span style={{ fontWeight: 700, color: 'var(--accent-pine)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookOpen size={15} /> Kéo thả hàng bất kỳ để tạo bộ thẻ con
        </span>
      </div>

      {/* Options Dropdown Modal (Gear Icon) */}
      {menuDeck && (
        <div className="modal-backdrop" onClick={() => setMenuDeck(null)}>
          <div className="modal-box" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 className="modal-heading" style={{ fontSize: '1.05rem' }}>
                📁 Cài đặt: {menuDeck.name}
              </h3>
              <button className="btn-tactile sm" onClick={() => setMenuDeck(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-tactile primary"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => {
                  handleStartStudy(menuDeck);
                  setMenuDeck(null);
                }}
              >
                <Play size={16} />
                <span>⚡ Bắt đầu Ôn tập ({getAggregatedCounts(menuDeck).totalCards} thẻ)</span>
              </button>

              <button
                className="btn-tactile"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => {
                  setDeckForAddCard(menuDeck);
                  setMenuDeck(null);
                }}
              >
                <Plus size={16} color="var(--accent-pine)" />
                <span style={{ fontWeight: 700, color: 'var(--accent-pine)' }}>➕ Thêm Thẻ Mới (Add Card)</span>
              </button>

              <button
                className="btn-tactile"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => {
                  setDeckIdForCsvImport(menuDeck.id);
                  setMenuDeck(null);
                }}
              >
                <Upload size={16} color="var(--accent-pine)" />
                <span style={{ fontWeight: 700, color: 'var(--accent-pine)' }}>📥 Nhập thẻ nhanh từ file CSV (Anki Import)</span>
              </button>

              <button
                className="btn-tactile"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={async () => {
                  const promptText = buildAiCsvPrompt(menuDeck.name, 'typing_2way');
                  try {
                    await navigator.clipboard.writeText(promptText);
                  } catch {
                    const ta = document.createElement('textarea');
                    ta.value = promptText;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                  }
                  setImportSuccessMsg(
                    `Đã sao chép Prompt tạo CSV cho bộ "${menuDeck.name}". Hãy dán vào ChatGPT / Gemini / Claude!`
                  );
                  setMenuDeck(null);
                }}
              >
                <Copy size={16} color="var(--accent-pine)" />
                <span>📋 Sao chép Prompt tạo CSV cho AI</span>
              </button>

              <button
                className="btn-tactile"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => {
                  setRenameDeck(menuDeck);
                  setRenameValue(menuDeck.name);
                }}
              >
                <Edit3 size={16} />
                <span>Đổi tên bộ thẻ</span>
              </button>

              {menuDeck.level > 0 && (
                <button
                  className="btn-tactile"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => {
                    setDecks((prev) => moveDeckNode(menuDeck.id, null, prev));
                    setMenuDeck(null);
                  }}
                >
                  <ArrowUpRight size={16} />
                  <span>Đưa ra ngoài làm Bộ thẻ gốc (Cấp 0)</span>
                </button>
              )}

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

      {/* ========================================================================= */}
      {/* ADD CARD MODAL - Clean, Basic, Easy-to-Use Single-Column Layout           */}
      {/* ========================================================================= */}
      {deckForAddCard && (
        <div className="modal-backdrop" onClick={() => setDeckForAddCard(null)}>
          <div
            className="modal-box"
            style={{
              maxWidth: '560px',
              width: '94%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingBottom: '14px',
                marginBottom: '18px',
                borderBottom: '1px solid #E2E8F0'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--ink-primary)' }}>
                  Thêm thẻ học mới
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', margin: '4px 0 0' }}>
                  Bộ thẻ: <strong style={{ color: 'var(--accent-pine)' }}>{deckForAddCard.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeckForAddCard(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--ink-secondary)'
                }}
                title="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            {/* Card Type Dropdown */}
            <div style={{ marginBottom: '16px' }}>
              <label
                htmlFor="card-type-select"
                style={{
                  display: 'block',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--ink-primary)',
                  marginBottom: '6px'
                }}
              >
                Loại thẻ
              </label>
              <select
                id="card-type-select"
                value={selectedCardType}
                onChange={(e) => setSelectedCardType(e.target.value as CardType)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: 'var(--ink-primary)',
                  background: 'var(--bg-surface)',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="typing_2way">Từ vựng Gõ phím 2 chiều (Tự tạo 2 thẻ: Kanji→Hiragana & Nghĩa→Nhật)</option>
                <option value="vocab">Từ vựng Lật thẻ truyền thống (1 thẻ/từ)</option>
                <option value="basic">Cơ bản (Mặt trước hỏi → Mặt sau trả lời)</option>
                <option value="reversed">Hai chiều Lật thẻ (Tự tạo 2 thẻ: Thuận & Đảo)</option>
                <option value="cloze">Điền vào chỗ trống (Cloze Deletion)</option>
              </select>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              {/* --- TYPE: TYPING_2WAY & VOCAB --- */}
              {(selectedCardType === 'typing_2way' || selectedCardType === 'vocab') && (
                <>
                  {selectedCardType === 'typing_2way' && (
                    <div
                      style={{
                        padding: '8px 12px',
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        color: '#166534'
                      }}
                    >
                      Mỗi từ lưu vào sẽ tự động tạo ra <strong>2 thẻ luyện gõ</strong>: Thẻ 1 (Hiện Kanji → Gõ Hiragana) và Thẻ 2 (Hiện Nghĩa Việt → Gõ từ Tiếng Nhật).
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
                        Kanji (Từ tiếng Nhật) <span style={{ color: 'var(--accent-vermilion)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: 勉強"
                        value={vocabWord}
                        onChange={(e) => setVocabWord(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.92rem',
                          background: 'var(--bg-surface)',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
                        Hiragana (Cách đọc) <span style={{ color: 'var(--accent-vermilion)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: べんきょう"
                        value={vocabReading}
                        onChange={(e) => setVocabReading(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.92rem',
                          background: 'var(--bg-surface)',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
                        Ý nghĩa của từ (Tiếng Việt) <span style={{ color: 'var(--accent-vermilion)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: học tập, nghiên cứu"
                        value={vocabMeaning}
                        onChange={(e) => setVocabMeaning(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.92rem',
                          background: 'var(--bg-surface)',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
                        Nghĩa Hán Việt
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: MIỄN CƯỠNG"
                        value={vocabSinoVi}
                        onChange={(e) => setVocabSinoVi(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.92rem',
                          background: 'var(--bg-surface)',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
                        Ví dụ của từ (Câu tiếng Nhật)
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: 毎日日本語を勉強します。"
                        value={vocabExJa}
                        onChange={(e) => setVocabExJa(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.9rem',
                          background: 'var(--bg-surface)',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
                        Dịch nghĩa ví dụ (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Tôi học tiếng Nhật mỗi ngày."
                        value={vocabExVi}
                        onChange={(e) => setVocabExVi(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.9rem',
                          background: 'var(--bg-surface)',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: 'var(--ink-secondary)' }}>
                      Audio phát âm (Để dành mở rộng sau)
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder="Sẽ hỗ trợ tải file âm thanh riêng ở phiên bản tiếp theo (hiện tự động phát âm TTS)"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.82rem',
                        background: '#F1F5F9',
                        border: '1px dashed #CBD5E1',
                        borderRadius: '8px',
                        color: 'var(--ink-secondary)',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>
                </>
              )}

              {/* --- TYPE: BASIC --- */}
              {selectedCardType === 'basic' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
                      Mặt trước (Câu hỏi / Từ vựng) <span style={{ color: 'var(--accent-vermilion)' }}>*</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Nhập nội dung mặt trước..."
                      value={basicFront}
                      onChange={(e) => setBasicFront(e.target.value)}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '0.92rem',
                        background: 'var(--bg-surface)',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '8px',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
                      Mặt sau (Câu trả lời / Ý nghĩa) <span style={{ color: 'var(--accent-vermilion)' }}>*</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Nhập nội dung mặt sau..."
                      value={basicBack}
                      onChange={(e) => setBasicBack(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '0.92rem',
                        background: 'var(--bg-surface)',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '8px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </>
              )}

              {/* --- TYPE: REVERSED --- */}
              {selectedCardType === 'reversed' && (
                <>
                  <div
                    style={{
                      padding: '8px 12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: 'var(--ink-secondary)'
                    }}
                  >
                    Tự động tạo <strong>2 thẻ</strong>: Thẻ 1 (Tiếng Nhật → Tiếng Việt) và Thẻ 2 (Tiếng Việt → Tiếng Nhật).
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
                        Mặt A (Tiếng Nhật) <span style={{ color: 'var(--accent-vermilion)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: 約束"
                        value={revFront}
                        onChange={(e) => setRevFront(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.92rem',
                          background: 'var(--bg-surface)',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
                        Cách đọc Hiragana
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: やくそく"
                        value={revReading}
                        onChange={(e) => setRevReading(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.92rem',
                          background: 'var(--bg-surface)',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
                      Mặt B (Nghĩa tiếng Việt) <span style={{ color: 'var(--accent-vermilion)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: lời hứa, cuộc hẹn"
                      value={revBack}
                      onChange={(e) => setRevBack(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '0.92rem',
                        background: 'var(--bg-surface)',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                </>
              )}

              {/* --- TYPE: CLOZE --- */}
              {selectedCardType === 'cloze' && (
                <>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
                        Câu văn tiếng Nhật có chỗ trống <span style={{ color: 'var(--accent-vermilion)' }}>*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleInsertCloze}
                        style={{
                          padding: '3px 10px',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          color: 'var(--accent-pine)',
                          background: '#F0FDF4',
                          border: '1px solid var(--accent-pine)',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Bôi đen chữ trong ô rồi nhấn nút này để tạo chỗ trống"
                      >
                        + Tạo chỗ trống {'{{c1::...}}'}
                      </button>
                    </div>
                    <textarea
                      ref={clozeTextareaRef}
                      rows={2}
                      placeholder="Ví dụ: 私は毎日{{c1::日本語}}を勉強します。"
                      value={clozeSentence}
                      onChange={(e) => setClozeSentence(e.target.value)}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '0.92rem',
                        background: 'var(--bg-surface)',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '8px',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
                        Gợi ý trong ngoặc (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: tiếng Nhật"
                        value={clozeHint}
                        onChange={(e) => setClozeHint(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.9rem',
                          background: 'var(--bg-surface)',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--ink-primary)' }}>
                        Dịch nghĩa cả câu
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Tôi học tiếng Nhật mỗi ngày."
                        value={clozeMeaning}
                        onChange={(e) => setClozeMeaning(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.9rem',
                          background: 'var(--bg-surface)',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Clean Side-by-Side Live Preview (Front & Back shown simultaneously) */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px'
              }}
            >
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                {selectedCardType === 'typing_2way'
                  ? 'Xem trước 2 thẻ sẽ được tạo (Mặt sau của cả 2 thẻ đều hiện đầy đủ các trường)'
                  : 'Xem trước thẻ (Mặt trước & Mặt sau)'}
              </div>

              {selectedCardType === 'typing_2way' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {/* Card 1 Preview */}
                    <div
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '10px 12px'
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-pine)', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Thẻ 1 • Mặt trước (Kanji → Gõ Hiragana)
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                        {vocabWord || '勉強'}
                      </div>
                      <div
                        style={{
                          padding: '5px 8px',
                          fontSize: '0.76rem',
                          background: '#F8FAFC',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          color: 'var(--ink-secondary)'
                        }}
                      >
                        ⌨️ Ô nhập: Gõ Hiragana ({vocabReading || 'べんきょう'})...
                      </div>
                    </div>

                    {/* Card 2 Preview */}
                    <div
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '10px 12px'
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0284C7', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Thẻ 2 • Mặt trước (Nghĩa → Gõ Tiếng Nhật)
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                        {vocabMeaning || 'học tập, nghiên cứu'}
                      </div>
                      <div
                        style={{
                          padding: '5px 8px',
                          fontSize: '0.76rem',
                          background: '#F8FAFC',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          color: 'var(--ink-secondary)'
                        }}
                      >
                        ⌨️ Ô nhập: Gõ từ Nhật ({vocabWord || '勉強'})...
                      </div>
                    </div>
                  </div>

                  {/* Shared Back Preview showing all fields */}
                  <div
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Mặt sau của cả 2 thẻ (Hiển thị toàn bộ các trường)
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                      <span><strong>Kanji:</strong> {vocabWord || '勉強'}</span>
                      <span><strong>Hiragana:</strong> <span style={{ color: 'var(--accent-vermilion)', fontWeight: 600 }}>{vocabReading || 'べんきょう'}</span></span>
                      <span><strong>Hán Việt:</strong> {vocabSinoVi || 'MIỄN CƯỠNG'}</span>
                      <span><strong>Ý nghĩa:</strong> <span style={{ color: 'var(--accent-pine)', fontWeight: 600 }}>{vocabMeaning || 'học tập, nghiên cứu'}</span></span>
                    </div>
                    {(vocabExJa || vocabExVi) && (
                      <div style={{ marginTop: '4px', color: 'var(--ink-secondary)', fontSize: '0.78rem' }}>
                        <strong>Ví dụ:</strong> {vocabExJa} {vocabExVi ? `(${vocabExVi})` : ''}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Front Card Box */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '12px',
                    minHeight: '92px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Mặt trước
                  </span>
                  {selectedCardType === 'vocab' && (
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
                      {vocabWord || '日本語'}
                    </div>
                  )}
                  {selectedCardType === 'basic' && (
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
                      {basicFront || 'Câu hỏi mặt trước'}
                    </div>
                  )}
                  {selectedCardType === 'reversed' && (
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink-primary)' }}>
                      {revFront || '約束'}
                    </div>
                  )}
                  {selectedCardType === 'cloze' && (
                    <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--ink-primary)', lineHeight: 1.5 }}>
                      {(clozeSentence || '私は毎日{{c1::日本語}}を勉強します。').replace(
                        /\{\{c\d+::(.*?)\}\}/g,
                        `[${clozeHint || '...'}]`
                      )}
                    </div>
                  )}
                </div>

                {/* Back Card Box */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '12px',
                    minHeight: '92px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-pine)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Mặt sau
                  </span>
                  {selectedCardType === 'vocab' && (
                    <div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--accent-vermilion)', fontWeight: 600 }}>
                        {vocabReading || 'にほんご'}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-pine)' }}>
                        {vocabMeaning || 'tiếng Nhật'}
                      </div>
                    </div>
                  )}
                  {selectedCardType === 'basic' && (
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-pine)' }}>
                      {basicBack || 'Câu trả lời mặt sau'}
                    </div>
                  )}
                  {selectedCardType === 'reversed' && (
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-pine)' }}>
                        {revBack || 'lời hứa, cuộc hẹn'}
                      </div>
                      {revReading && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)' }}>({revReading})</div>
                      )}
                    </div>
                  )}
                  {selectedCardType === 'cloze' && (
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-pine)', lineHeight: 1.5 }}>
                        {(clozeSentence || '私は毎日{{c1::日本語}}を勉強します。').replace(
                          /\{\{c\d+::(.*?)\}\}/g,
                          '$1'
                        )}
                      </div>
                      {clozeMeaning && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)', marginTop: '2px' }}>
                          {clozeMeaning}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '14px',
                borderTop: '1px solid #E2E8F0'
              }}
            >
              <button
                type="button"
                className="btn-tactile"
                onClick={() => setDeckForAddCard(null)}
                style={{ padding: '8px 16px' }}
              >
                Hủy
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-tactile"
                  onClick={() => handleSaveCard(true)}
                  style={{ padding: '8px 14px' }}
                  title="Lưu thẻ này và giữ nguyên cửa sổ để nhập tiếp thẻ mới"
                >
                  <RefreshCw size={14} /> Thêm & Tiếp tục
                </button>
                <button
                  type="button"
                  className="btn-tactile primary"
                  onClick={() => handleSaveCard(false)}
                  style={{ padding: '8px 18px' }}
                >
                  <Plus size={16} /> Lưu thẻ
                </button>
              </div>
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
                <button type="button" className="btn-tactile sm" onClick={() => setRenameDeck(null)}>
                  <X size={16} />
                </button>
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
                <button type="button" className="btn-tactile" onClick={() => setRenameDeck(null)}>
                  Hủy
                </button>
                <button type="submit" className="btn-tactile primary">
                  Lưu thay đổi
                </button>
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
              <button className="btn-tactile sm" onClick={() => setDeckToDelete(null)}>
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--ink-secondary)', marginBottom: '20px' }}>
              Bạn có chắc chắn muốn xóa bộ thẻ <strong>"{deckToDelete.name}"</strong>? Toàn bộ thẻ và các bộ thẻ con bên trong sẽ bị xóa.
            </p>
            <div className="modal-foot">
              <button className="btn-tactile" onClick={() => setDeckToDelete(null)}>
                Hủy
              </button>
              <button className="btn-tactile vermilion" onClick={handleConfirmDelete}>
                Xóa vĩnh viễn
              </button>
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
                <button type="button" className="btn-tactile sm" onClick={() => setShowCreateModal(false)}>
                  <X size={16} />
                </button>
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
                <button type="button" className="btn-tactile" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-tactile primary">
                  Tạo ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal (Anki-compatible CSV / TSV Import) */}
      {deckIdForCsvImport && (
        <CsvImportModal
          initialDeckId={deckIdForCsvImport}
          deckOptions={flattenDeckOptions(decks)}
          existingCardsByDeck={buildExistingCardsMap(decks)}
          onClose={() => setDeckIdForCsvImport(null)}
          onConfirmImport={handleConfirmCsvImport}
        />
      )}
    </div>
  );
};
