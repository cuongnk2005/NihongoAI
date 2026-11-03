/**
 * NihongoAI Interactive Prototype Engine (P4.4)
 * Architecture: Dependency-free, Client-side State, Kyoto Tactile Mechanics
 */

(function () {
  'use strict';

  // State Management
  let state = {
    theme: 'light',
    currentView: 'view-review',
    currentDeckId: 'deck-1',
    activeCardIndex: 0,
    isCardFlipped: false,
    undoStack: [],
    reviewQueue: [],
    decks: [],
    cards: [],
    isImeComposing: false,
    hasSimulatedFailure: false
  };

  // DOM Elements Cache
  const dom = {
    // Navigation
    tabReview: document.getElementById('tabReview'),
    tabDecks: document.getElementById('tabDecks'),
    tabPractice: document.getElementById('tabPractice'),
    panels: document.querySelectorAll('.view-panel'),
    btnThemeToggle: document.getElementById('btnThemeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    btnResetState: document.getElementById('btnResetState'),
    
    // Review HUD & Card
    currentDeckTitle: document.getElementById('currentDeckTitle'),
    countNew: document.getElementById('countNew'),
    countLearning: document.getElementById('countLearning'),
    countReview: document.getElementById('countReview'),
    flashcardBox: document.getElementById('flashcardBox'),
    cardJlptBadge: document.getElementById('cardJlptBadge'),
    cardPosBadge: document.getElementById('cardPosBadge'),
    cardKanji: document.getElementById('cardKanji'),
    cardRuby: document.getElementById('cardRuby'),
    cardMeaning: document.getElementById('cardMeaning'),
    cardExampleBox: document.getElementById('cardExampleBox'),
    cardExampleJa: document.getElementById('cardExampleJa'),
    cardExampleVi: document.getElementById('cardExampleVi'),
    flipCue: document.getElementById('flipCue'),
    ratingDeck: document.getElementById('ratingDeck'),
    btnUndoReview: document.getElementById('btnUndoReview'),
    sessionProgressFill: document.getElementById('sessionProgressFill'),
    sessionProgressText: document.getElementById('sessionProgressText'),

    // Decks Board
    decksListContainer: document.getElementById('decksListContainer'),
    laneListNew: document.getElementById('laneListNew'),
    laneListLearning: document.getElementById('laneListLearning'),
    laneListReview: document.getElementById('laneListReview'),
    laneCountNew: document.getElementById('laneCountNew'),
    laneCountLearning: document.getElementById('laneCountLearning'),
    laneCountReview: document.getElementById('laneCountReview'),
    btnNewDeck: document.getElementById('btnNewDeck'),

    // Practice & IME
    practicePromptText: document.getElementById('practicePromptText'),
    japaneseInput: document.getElementById('japaneseInput'),
    imeBadge: document.getElementById('imeBadge'),
    btnSubmitPractice: document.getElementById('btnSubmitPractice'),
    btnFillSampleAnswer: document.getElementById('btnFillSampleAnswer'),
    aiFeedbackCard: document.getElementById('aiFeedbackCard'),

    // Modal
    modalBackdrop: document.getElementById('modalBackdrop'),
    btnOpenModal: document.getElementById('btnOpenModal'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    btnSaveModal: document.getElementById('btnSaveModal'),
    vocabForm: document.getElementById('vocabForm'),
    formDeckSelect: document.getElementById('formDeckSelect'),
    formWordInput: document.getElementById('formWordInput'),
    formReadingInput: document.getElementById('formReadingInput'),
    formMeaningInput: document.getElementById('formMeaningInput'),
    formLevelSelect: document.getElementById('formLevelSelect'),
    chkSimulateError: document.getElementById('chkSimulateError'),

    // Toast
    toastDock: document.getElementById('toastDock')
  };

  /* ==========================================================================
     1. INITIALIZATION & DATA RESET
     ========================================================================== */
  function init() {
    resetStateToDefaults();
    bindEvents();
    renderAll();
    showToast('✨ Hệ thống Kyoto Studio Prototype đã sẵn sàng!');
  }

  function resetStateToDefaults() {
    const raw = window.NIHONGO_MOCK || {};
    state.decks = JSON.parse(JSON.stringify(raw.decks || []));
    state.cards = JSON.parse(JSON.stringify(raw.cards || []));
    state.currentDeckId = 'deck-1';
    state.activeCardIndex = 0;
    state.isCardFlipped = false;
    state.undoStack = [];
    state.hasSimulatedFailure = false;
    refreshReviewQueue();
  }

  function refreshReviewQueue() {
    state.reviewQueue = state.cards.filter(c => c.deckId === state.currentDeckId);
    state.activeCardIndex = 0;
    state.isCardFlipped = false;
  }

  /* ==========================================================================
     2. EVENT LISTENERS
     ========================================================================== */
  function bindEvents() {
    // Navigation Tabs
    dom.tabReview.addEventListener('click', () => switchView('view-review'));
    dom.tabDecks.addEventListener('click', () => switchView('view-decks'));
    dom.tabPractice.addEventListener('click', () => switchView('view-practice'));

    // Theme Toggle
    dom.btnThemeToggle.addEventListener('click', toggleTheme);

    // Reset State
    dom.btnResetState.addEventListener('click', () => {
      resetStateToDefaults();
      renderAll();
      showToast('Đã đặt lại dữ liệu nguyên bản.');
    });

    // Review Card Flip
    dom.flashcardBox.addEventListener('click', toggleFlipCard);

    // Rating Buttons Click
    document.querySelectorAll('.rating-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const grade = parseInt(btn.dataset.grade, 10);
        handleReviewRating(grade);
      });
    });

    // Undo Review
    dom.btnUndoReview.addEventListener('click', undoLastReview);

    // IME Events on Japanese Input
    dom.japaneseInput.addEventListener('compositionstart', () => {
      state.isImeComposing = true;
      dom.imeBadge.textContent = 'Đang gõ IME (chọn chữ Kanji...)';
      dom.imeBadge.classList.add('composing');
    });

    dom.japaneseInput.addEventListener('compositionend', () => {
      state.isImeComposing = false;
      dom.imeBadge.textContent = 'Sẵn sàng (Bấm Enter để nộp)';
      dom.imeBadge.classList.remove('composing');
    });

    dom.japaneseInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (state.isImeComposing || e.isComposing) {
          // IME Kanji selection in progress -> DO NOT SUBMIT
          return;
        }
        e.preventDefault();
        evaluateSentence();
      }
    });

    dom.btnSubmitPractice.addEventListener('click', evaluateSentence);
    dom.btnFillSampleAnswer.addEventListener('click', () => {
      dom.japaneseInput.value = '友達とこの映画を見たことがあります。';
      showToast('Đã điền đáp án mẫu tiếng Nhật.');
    });

    // Modal Events
    dom.btnOpenModal.addEventListener('click', openModal);
    dom.btnCancelModal.addEventListener('click', attemptCloseModal);
    dom.vocabForm.addEventListener('submit', handleFormSubmit);

    dom.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === dom.modalBackdrop) {
        attemptCloseModal();
      }
    });

    // New Deck Button
    dom.btnNewDeck.addEventListener('click', () => {
      const name = prompt('Nhập tên bộ thẻ mới:', 'Từ vựng JLPT N3');
      if (name && name.trim()) {
        const newDeck = {
          id: 'deck-' + Date.now(),
          name: name.trim(),
          description: 'Bộ thẻ tùy chỉnh vừa tạo',
          cardsCount: 0,
          isDefault: false
        };
        state.decks.push(newDeck);
        renderDecksList();
        showToast(`Đã tạo bộ thẻ: ${newDeck.name}`);
      }
    });

    // Global Keyboard Listener
    window.addEventListener('keydown', handleGlobalKeydown);
  }

  /* ==========================================================================
     3. GLOBAL KEYBOARD NAVIGATION
     ========================================================================== */
  function handleGlobalKeydown(e) {
    // If modal is open
    if (dom.modalBackdrop.classList.contains('open')) {
      if (e.key === 'Escape') {
        attemptCloseModal();
        return;
      }
      // Accessibility Focus Trap: Keep Tab navigation inside modal
      if (e.key === 'Tab') {
        const focusables = dom.modalBackdrop.querySelectorAll('input, select, button');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      return;
    }

    // If focused on an input inside Practice or elsewhere, ignore hotkeys
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }

    // Only active in Review View
    if (state.currentView !== 'view-review') return;

    // Undo (Ctrl + Z)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undoLastReview();
      return;
    }

    // Space or Enter: Flip card
    if (e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      toggleFlipCard();
      return;
    }

    // Number keys 1-4 for FSRS review ratings (only if card is flipped)
    if (state.isCardFlipped) {
      if (e.key === '1') handleReviewRating(1);
      if (e.key === '2') handleReviewRating(2);
      if (e.key === '3') handleReviewRating(3);
      if (e.key === '4') handleReviewRating(4);
    }
  }

  /* ==========================================================================
     4. VIEW SWITCHING
     ========================================================================== */
  function switchView(viewId) {
    state.currentView = viewId;
    dom.panels.forEach(p => p.classList.toggle('active', p.id === viewId));
    dom.tabReview.classList.toggle('active', viewId === 'view-review');
    dom.tabDecks.classList.toggle('active', viewId === 'view-decks');
    dom.tabPractice.classList.toggle('active', viewId === 'view-practice');

    if (viewId === 'view-decks') {
      renderDecksBoard();
    }
  }

  function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    if (state.theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      dom.themeIcon.textContent = '☀️';
      showToast('Đã kích hoạt chế độ Kyoto Night Studio');
    } else {
      document.body.removeAttribute('data-theme');
      dom.themeIcon.textContent = '🌙';
      showToast('Đã kích hoạt chế độ Kyoto Daylight Studio');
    }
  }

  /* ==========================================================================
     5. SPEED REVIEW ENGINE (FSRS)
     ========================================================================== */
  function toggleFlipCard() {
    state.isCardFlipped = !state.isCardFlipped;
    renderCardFlipState();
  }

  function renderCardFlipState() {
    dom.cardRuby.classList.toggle('show', state.isCardFlipped);
    dom.cardMeaning.classList.toggle('show', state.isCardFlipped);
    dom.cardExampleBox.classList.toggle('show', state.isCardFlipped);
    dom.ratingDeck.classList.toggle('active', state.isCardFlipped);
    dom.flipCue.style.visibility = state.isCardFlipped ? 'hidden' : 'visible';
  }

  function renderReviewStage() {
    const queue = state.reviewQueue;
    const currentDeck = state.decks.find(d => d.id === state.currentDeckId) || state.decks[0];
    dom.currentDeckTitle.textContent = currentDeck ? currentDeck.name : 'Tất cả thẻ';

    // Counts
    const newCount = queue.filter(c => c.status === 'new').length;
    const learningCount = queue.filter(c => c.status === 'learning').length;
    const reviewCount = queue.filter(c => c.status === 'review').length;
    dom.countNew.textContent = newCount;
    dom.countLearning.textContent = learningCount;
    dom.countReview.textContent = reviewCount;

    if (queue.length === 0 || state.activeCardIndex >= queue.length) {
      // Completed Queue Screen
      dom.cardKanji.textContent = '🎉';
      dom.cardRuby.textContent = 'お疲れ様でした';
      dom.cardRuby.classList.add('show');
      dom.cardMeaning.classList.add('show');
      dom.cardMeaning.innerHTML = `
        <div style="margin-bottom: 22px;">Bạn đã hoàn thành phiên ôn tập hôm nay!</div>
        <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
          <button class="btn-tactile primary" id="btnRestartQueue">↺ Ôn tập lại từ đầu</button>
          <button class="btn-tactile" id="btnGoToDecks">🗂️ Đổi bộ thẻ khác</button>
        </div>
      `;

      // Event listeners for action buttons
      setTimeout(() => {
        document.getElementById('btnRestartQueue')?.addEventListener('click', () => {
          state.activeCardIndex = 0;
          state.isCardFlipped = false;
          renderReviewStage();
          showToast('Bắt đầu lại phiên ôn tập!');
        });
        document.getElementById('btnGoToDecks')?.addEventListener('click', () => {
          switchView('view-decks');
        });
      }, 0);

      dom.cardExampleBox.classList.remove('show');
      dom.ratingDeck.classList.remove('active');
      dom.flipCue.style.display = 'none';
      dom.sessionProgressFill.style.width = '100%';
      dom.sessionProgressText.textContent = 'Hoàn thành';
      return;
    }

    dom.flipCue.style.display = 'flex';
    const card = queue[state.activeCardIndex];
    dom.cardJlptBadge.textContent = `JLPT ${card.jlpt || 'N5'}`;
    dom.cardPosBadge.textContent = card.partOfSpeech || 'Từ vựng';
    dom.cardKanji.textContent = card.word;
    dom.cardRuby.textContent = card.reading;
    dom.cardMeaning.textContent = card.meaningVi;
    dom.cardExampleJa.textContent = card.exampleJa || '';
    dom.cardExampleVi.textContent = card.exampleVi || '';

    // Progress bar
    const progressPercent = Math.round(((state.activeCardIndex + 1) / queue.length) * 100);
    dom.sessionProgressFill.style.width = `${progressPercent}%`;
    dom.sessionProgressText.textContent = `Thẻ ${state.activeCardIndex + 1} / ${queue.length}`;

    renderCardFlipState();
  }

  function handleReviewRating(grade) {
    if (!state.isCardFlipped) return;
    const currentCard = state.reviewQueue[state.activeCardIndex];
    if (!currentCard) return;

    // Save previous state for Undo
    state.undoStack.push({
      cardIndex: state.activeCardIndex,
      cardId: currentCard.id,
      previousStatus: currentCard.status,
      previousInterval: currentCard.intervalDays
    });

    // FSRS State updates
    const gradeNames = { 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy' };
    if (grade === 1) {
      currentCard.status = 'learning';
      currentCard.intervalDays = 0;
    } else if (grade === 2) {
      currentCard.status = 'review';
      currentCard.intervalDays = Math.max(1, (currentCard.intervalDays || 1) * 1.2);
    } else if (grade === 3) {
      currentCard.status = 'review';
      currentCard.intervalDays = Math.max(2, (currentCard.intervalDays || 1) * 2.2);
    } else if (grade === 4) {
      currentCard.status = 'mastered';
      currentCard.intervalDays = Math.max(4, (currentCard.intervalDays || 1) * 3.5);
    }

    // Mechanical animation feedback
    dom.flashcardBox.style.transform = 'translate(4px, 4px)';
    dom.flashcardBox.style.boxShadow = '2px 2px 0px var(--border-color)';

    setTimeout(() => {
      dom.flashcardBox.style.transform = '';
      dom.flashcardBox.style.boxShadow = '';
      state.isCardFlipped = false;
      state.activeCardIndex++;
      renderReviewStage();
      showToast(`Đã đánh giá: ${gradeNames[grade]}`);
    }, 120);
  }

  function undoLastReview() {
    if (state.undoStack.length === 0) {
      showToast('Không có thẻ nào để hoàn tác.');
      return;
    }
    const last = state.undoStack.pop();
    const card = state.cards.find(c => c.id === last.cardId);
    if (card) {
      card.status = last.previousStatus;
      card.intervalDays = last.previousInterval;
    }
    state.activeCardIndex = last.cardIndex;
    state.isCardFlipped = true; // Return to answer state
    renderReviewStage();
    showToast('↩ Đã hoàn tác lượt đánh giá trước!');
  }

  /* ==========================================================================
     6. DECKS & CARD BOARD (LANES & DRAG-AND-DROP)
     ========================================================================== */
  function renderDecksBoard() {
    renderDecksList();
    renderCardLanes();
  }

  function renderDecksList() {
    dom.decksListContainer.innerHTML = '';
    state.decks.forEach(deck => {
      const count = state.cards.filter(c => c.deckId === deck.id).length;
      const el = document.createElement('div');
      el.className = `deck-item ${deck.id === state.currentDeckId ? 'active' : ''}`;
      el.innerHTML = `
        <div class="deck-item-name">${escapeHtml(deck.name)}</div>
        <div class="deck-item-meta">${count} thẻ ghi nhớ</div>
      `;
      el.addEventListener('click', () => {
        state.currentDeckId = deck.id;
        refreshReviewQueue();
        renderDecksBoard();
        renderReviewStage();
      });
      dom.decksListContainer.appendChild(el);
    });
  }

  function renderCardLanes() {
    const deckCards = state.cards.filter(c => c.deckId === state.currentDeckId);

    const lanes = {
      new: { list: dom.laneListNew, count: dom.laneCountNew, cards: deckCards.filter(c => c.status === 'new') },
      learning: { list: dom.laneListLearning, count: dom.laneCountLearning, cards: deckCards.filter(c => c.status === 'learning') },
      review: { list: dom.laneListReview, count: dom.laneCountReview, cards: deckCards.filter(c => c.status === 'review' || c.status === 'mastered') }
    };

    Object.keys(lanes).forEach(status => {
      const lane = lanes[status];
      lane.count.textContent = lane.cards.length;
      lane.list.innerHTML = '';

      if (lane.cards.length === 0) {
        lane.list.innerHTML = `
          <div class="empty-lane-placeholder">
            <div>Chưa có thẻ nào</div>
            <div style="font-size: 0.75rem; margin-top: 4px;">Kéo thả thẻ vào đây</div>
          </div>
        `;
      } else {
        lane.cards.forEach(card => {
          const item = document.createElement('div');
          item.className = 'lane-card-item';
          item.draggable = true;
          item.dataset.cardId = card.id;
          item.innerHTML = `
            <div class="lane-card-kanji">${escapeHtml(card.word)}</div>
            <div class="lane-card-meaning">${escapeHtml(card.meaningVi)}</div>
          `;

          // Drag Events
          item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', card.id);
            item.style.opacity = '0.4';
          });
          item.addEventListener('dragend', () => {
            item.style.opacity = '1';
          });

          lane.list.appendChild(item);
        });
      }
    });

    // Make lanes droppable
    document.querySelectorAll('.lane').forEach(laneEl => {
      laneEl.addEventListener('dragover', (e) => e.preventDefault());
      laneEl.addEventListener('drop', (e) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('text/plain');
        const targetStatus = laneEl.dataset.status;
        const card = state.cards.find(c => c.id === cardId);
        if (card && targetStatus && card.status !== targetStatus) {
          card.status = targetStatus;
          renderCardLanes();
          renderReviewStage();
          showToast(`Đã chuyển thẻ "${card.word}" sang trạng thái: ${targetStatus.toUpperCase()}`);
        }
      });
    });
  }

  /* ==========================================================================
     7. SENTENCE PRACTICE & IME GUARD
     ========================================================================== */
  function evaluateSentence() {
    const input = dom.japaneseInput.value.trim();
    if (!input) {
      showToast('⚠️ Vui lòng nhập câu tiếng Nhật của bạn.');
      dom.japaneseInput.focus();
      return;
    }

    dom.btnSubmitPractice.textContent = 'AI đang suy nghĩ...';
    dom.btnSubmitPractice.style.opacity = '0.7';

    setTimeout(() => {
      dom.btnSubmitPractice.textContent = 'Chấm bài (AI Evaluate)';
      dom.btnSubmitPractice.style.opacity = '1';
      dom.aiFeedbackCard.classList.add('show');
      dom.aiFeedbackCard.scrollIntoView({ behavior: 'smooth' });
      showToast('🎉 AI đã hoàn tất chấm điểm đa chiều!');
    }, 600);
  }

  /* ==========================================================================
     8. CENTERED CREATE/EDIT MODAL
     ========================================================================== */
  function openModal() {
    // Populate deck options
    dom.formDeckSelect.innerHTML = '';
    state.decks.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.name;
      if (d.id === state.currentDeckId) opt.selected = true;
      dom.formDeckSelect.appendChild(opt);
    });

    dom.modalBackdrop.classList.add('open');
    dom.formWordInput.focus();
  }

  function closeModal() {
    dom.modalBackdrop.classList.remove('open');
    dom.vocabForm.reset();
    clearFormErrors();
    state.hasSimulatedFailure = false;
    dom.btnSaveModal.textContent = 'Lưu vào CSDL';
    dom.btnSaveModal.classList.remove('vermilion');
  }

  function attemptCloseModal() {
    const hasData = dom.formWordInput.value.trim() || dom.formMeaningInput.value.trim();
    if (hasData) {
      const confirmDiscard = confirm('Nội dung bạn đang nhập chưa được lưu. Bạn có chắc muốn đóng và hủy bỏ?');
      if (!confirmDiscard) return;
    }
    closeModal();
  }

  function clearFormErrors() {
    dom.formWordInput.classList.remove('error');
    dom.formMeaningInput.classList.remove('error');
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    clearFormErrors();

    const word = dom.formWordInput.value.trim();
    const meaning = dom.formMeaningInput.value.trim();
    let hasError = false;

    if (!word) {
      dom.formWordInput.classList.add('error');
      hasError = true;
    }
    if (!meaning) {
      dom.formMeaningInput.classList.add('error');
      hasError = true;
    }
    if (hasError) return;

    // Simulated SQLite Error Check
    if (dom.chkSimulateError.checked && !state.hasSimulatedFailure) {
      state.hasSimulatedFailure = true;
      dom.btnSaveModal.textContent = 'Thử lại (Retry)';
      dom.btnSaveModal.classList.add('vermilion');
      showToast('❌ Lỗi mô phỏng: Không thể ghi CSDL SQLite! Dữ liệu đã được giữ nguyên để bạn thử lại.');
      return;
    }

    // Success flow
    const newCard = {
      id: 'c-' + Date.now(),
      deckId: dom.formDeckSelect.value,
      status: 'new',
      word: word,
      reading: dom.formReadingInput.value.trim() || word,
      meaningVi: meaning,
      jlpt: dom.formLevelSelect.value,
      exampleJa: `これは${word}の例文です。`,
      exampleVi: `Đây là ví dụ cho ${word}.`,
      intervalDays: 0,
      reps: 0
    };

    state.cards.push(newCard);
    refreshReviewQueue();
    renderAll();
    closeModal();
    showToast(`✅ Đã lưu thành công từ "${word}" vào bộ thẻ!`);
  }

  /* ==========================================================================
     9. UTILITIES & TOAST
     ========================================================================== */
  function renderAll() {
    renderReviewStage();
    renderDecksBoard();
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    dom.toastDock.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  // Self-boot
  window.addEventListener('DOMContentLoaded', init);

})();
