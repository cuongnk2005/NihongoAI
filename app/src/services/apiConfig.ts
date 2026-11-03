import { Vocabulary, Grammar, PracticeQuestion, EvaluationResult } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088/api';

const LOCAL_PRACTICE_BANK: Record<string, PracticeQuestion[]> = {
  N5: [
    {
      sentenceVi: 'Má»—i sÃ¡ng tÃ´i Ä‘á»u uá»‘ng cÃ  phÃª rá»“i Ä‘i lÃ m.',
      exampleAnswerJa: 'æ¯Žæœã‚³ãƒ¼ãƒ’ãƒ¼ã‚’é£²ã‚“ã§ã‹ã‚‰ä¼šç¤¾ã¸è¡Œãã¾ã™ã€‚',
      targetVocabulary: ['æ¯Žæœ (ã¾ã„ã‚ã•)', 'é£²ã‚€ (ã®ã‚€)', 'ä¼šç¤¾ (ã‹ã„ã—ã‚ƒ)'],
      targetGrammar: ['ï½žã¦ã‹ã‚‰'],
      difficulty: 'N5',
      hintVi: 'Cáº¥u trÃºc: [Äá»™ng tá»« thá»ƒ ã¦] + ã‹ã‚‰ (Sau khi lÃ m V1 thÃ¬ lÃ m V2).'
    },
    {
      sentenceVi: 'Cuá»‘i tuáº§n trÆ°á»›c tÃ´i Ä‘Ã£ Ä‘i xem phim cÃ¹ng vá»›i báº¡n bÃ¨.',
      exampleAnswerJa: 'å…ˆé€±ã®é€±æœ«ã€å‹é”ã¨æ˜ ç”»ã‚’è¦‹ã«è¡Œãã¾ã—ãŸã€‚',
      targetVocabulary: ['é€±æœ« (ã—ã‚…ã†ã¾ã¤)', 'å‹é” (ã¨ã‚‚ã ã¡)', 'æ˜ ç”» (ãˆã„ãŒ)'],
      targetGrammar: ['ï½žã«è¡Œã'],
      difficulty: 'N5',
      hintVi: 'Cáº¥u trÃºc chá»‰ má»¥c Ä‘Ã­ch di chuyá»ƒn: [V-bá» ã¾ã™] + ã«è¡Œã (Äi Ä‘á»ƒ lÃ m gÃ¬).'
    },
    {
      sentenceVi: 'Tá»‘i nay chÃºng ta cÃ¹ng Äƒn mÃ³n Nháº­t á»Ÿ nhÃ  hÃ ng nhÃ©?',
      exampleAnswerJa: 'ä»Šæ™©ã€ãƒ¬ã‚¹ãƒˆãƒ©ãƒ³ã§æ—¥æœ¬æ–™ç†ã‚’é£Ÿã¹ã¾ã›ã‚“ã‹ã€‚',
      targetVocabulary: ['ä»Šæ™© (ã“ã‚“ã°ã‚“)', 'æ—¥æœ¬æ–™ç† (ã«ã»ã‚“ã‚Šã‚‡ã†ã‚Š)', 'é£Ÿã¹ã‚‹ (ãŸã¹ã‚‹)'],
      targetGrammar: ['ï½žã¾ã›ã‚“ã‹'],
      difficulty: 'N5',
      hintVi: 'Máº«u cÃ¢u rá»§ rÃª lá»‹ch sá»±: [Äá»™ng tá»« bá» ã¾ã™] + ã¾ã›ã‚“ã‹.'
    },
    {
      sentenceVi: 'VÃ¬ trá»i Ä‘ang mÆ°a nÃªn tÃ´i sáº½ Ä‘i báº±ng tÃ u Ä‘iá»‡n.',
      exampleAnswerJa: 'é›¨ãŒé™ã£ã¦ã„ã¾ã™ã‹ã‚‰ã€é›»è»Šã§è¡Œãã¾ã™ã€‚',
      targetVocabulary: ['é›¨ (ã‚ã‚)', 'é™ã‚‹ (ãµã‚‹)', 'é›»è»Š (ã§ã‚“ã—ã‚ƒ)'],
      targetGrammar: ['ï½žã¦ã„ã¾ã™', 'ï½žã‹ã‚‰'],
      difficulty: 'N5',
      hintVi: 'Sá»­ dá»¥ng é›¨ãŒé™ã£ã¦ã„ã¾ã™ Ä‘á»ƒ diá»…n táº£ trá»i Ä‘ang mÆ°a vÃ  trá»£ tá»« ã§ chá»‰ phÆ°Æ¡ng tiá»‡n.'
    },
    {
      sentenceVi: 'TÃ´i muá»‘n mua má»™t chiáº¿c mÃ¡y tÃ­nh má»›i vÃ o thÃ¡ng sau.',
      exampleAnswerJa: 'æ¥æœˆã€æ–°ã—ã„ãƒ‘ã‚½ã‚³ãƒ³ã‚’è²·ã„ãŸã„ã§ã™ã€‚',
      targetVocabulary: ['æ¥æœˆ (ã‚‰ã„ã’ã¤)', 'æ–°ã—ã„ (ã‚ãŸã‚‰ã—ã„)', 'ãƒ‘ã‚½ã‚³ãƒ³'],
      targetGrammar: ['ï½žãŸã„ã§ã™'],
      difficulty: 'N5',
      hintVi: 'NÃ³i vá» mong muá»‘n cá»§a báº£n thÃ¢n: [Äá»™ng tá»« bá» ã¾ã™] + ãŸã„ã§ã™.'
    }
  ],
  N4: [
    {
      sentenceVi: 'TÃ´i Ä‘Ã£ tá»«ng xem bá»™ phim nÃ y cÃ¹ng vá»›i báº¡n bÃ¨.',
      exampleAnswerJa: 'å‹é”ã¨ã“ã®æ˜ ç”»ã‚’è¦‹ãŸã“ã¨ãŒã‚ã‚Šã¾ã™ã€‚',
      targetVocabulary: ['å‹é” (ã¨ã‚‚ã ã¡)', 'æ˜ ç”» (ãˆã„ãŒ)', 'è¦‹ã‚‹ (ã¿ã‚‹)'],
      targetGrammar: ['ï½žãŸã“ã¨ãŒã‚ã‚‹'],
      difficulty: 'N4',
      hintVi: 'Diá»…n táº£ kinh nghiá»‡m trong quÃ¡ khá»©: [Äá»™ng tá»« thá»ƒ ãŸ] + ã“ã¨ãŒã‚ã‚‹.'
    },
    {
      sentenceVi: 'Ká»³ nghá»‰ hÃ¨ nÄƒm sau tÃ´i dá»± Ä‘á»‹nh sáº½ Ä‘i du lá»‹ch Nháº­t Báº£n.',
      exampleAnswerJa: 'æ¥å¹´ã®å¤ä¼‘ã¿ã«æ—¥æœ¬ã¸æ—…è¡Œã«è¡Œãã¤ã‚‚ã‚Šã§ã™ã€‚',
      targetVocabulary: ['å¤ä¼‘ã¿ (ãªã¤ã‚„ã™ã¿)', 'æ—…è¡Œ (ã‚Šã‚‡ã“ã†)', 'æ—¥æœ¬ (ã«ã»ã‚“)'],
      targetGrammar: ['ï½žã¤ã‚‚ã‚Šã§ã™'],
      difficulty: 'N4',
      hintVi: 'Diá»…n táº£ dá»± Ä‘á»‹nh cháº¯c cháº¯n: [Äá»™ng tá»« thá»ƒ tá»« Ä‘iá»ƒn] + ã¤ã‚‚ã‚Šã§ã™.'
    },
    {
      sentenceVi: 'NgÃ y mai tÃ´i cÃ³ cuá»™c háº¹n quan trá»ng nÃªn pháº£i dáº­y sá»›m.',
      exampleAnswerJa: 'æ˜Žæ—¥ã¯å¤§åˆ‡ãªç´„æŸãŒã‚ã‚‹ã®ã§ã€æ—©ãèµ·ããªã‘ã‚Œã°ãªã‚Šã¾ã›ã‚“ã€‚',
      targetVocabulary: ['å¤§åˆ‡ãª (ãŸã„ã›ã¤ãª)', 'ç´„æŸ (ã‚„ããã)', 'èµ·ãã‚‹ (ãŠãã‚‹)'],
      targetGrammar: ['ï½žã®ã§', 'ï½žãªã‘ã‚Œã°ãªã‚Šã¾ã›ã‚“'],
      difficulty: 'N4',
      hintVi: 'Báº¯t buá»™c pháº£i lÃ m gÃ¬: [Äá»™ng tá»« thá»ƒ ãªã„ bá» ã„] + ã‘ã‚Œã°ãªã‚Šã¾ã›ã‚“.'
    },
    {
      sentenceVi: 'Náº¿u cÃ³ thá»i gian ráº£nh, tÃ´i muá»‘n há»c cÃ¡ch náº¥u mÃ³n Äƒn Nháº­t.',
      exampleAnswerJa: 'æš‡ãªæ™‚é–“ãŒã‚ã£ãŸã‚‰ã€æ—¥æœ¬ã®æ–™ç†ã®ä½œã‚Šæ–¹ã‚’ç¿’ã„ãŸã„ã§ã™ã€‚',
      targetVocabulary: ['æ™‚é–“ (ã˜ã‹ã‚“)', 'æ–™ç† (ã‚Šã‚‡ã†ã‚Š)', 'ç¿’ã† (ãªã‚‰ã†)'],
      targetGrammar: ['ï½žãŸã‚‰', 'ï½žæ–¹ (ã‹ãŸ)'],
      difficulty: 'N4',
      hintVi: 'CÃ¢u Ä‘iá»u kiá»‡n giáº£ Ä‘á»‹nh: [Thá»ƒ ãŸ] + ã‚‰ vÃ  cÃ¡ch lÃ m gÃ¬ Ä‘Ã³: [V-bá» ã¾ã™] + æ–¹.'
    },
    {
      sentenceVi: 'BÃ¡c sÄ© khuyÃªn tÃ´i nÃªn Äƒn nhiá»u rau vÃ  táº­p thá»ƒ dá»¥c má»—i ngÃ y.',
      exampleAnswerJa: 'æ¯Žæ—¥ã‚‚ã£ã¨é‡Žèœã‚’é£Ÿã¹ã¦ã€é‹å‹•ã—ãŸã»ã†ãŒã„ã„ã§ã™ã€‚',
      targetVocabulary: ['é‡Žèœ (ã‚„ã•ã„)', 'é£Ÿã¹ã‚‹ (ãŸã¹ã‚‹)', 'é‹å‹•ã™ã‚‹ (ã†ã‚“ã©ã†ã™ã‚‹)'],
      targetGrammar: ['ï½žãŸã»ã†ãŒã„ã„ã§ã™'],
      difficulty: 'N4',
      hintVi: 'Lá»i khuyÃªn nÃªn lÃ m gÃ¬: [Äá»™ng tá»« thá»ƒ ãŸ] + ã»ã†ãŒã„ã„ã§ã™.'
    }
  ],
  N3: [
    {
      sentenceVi: 'Nhá» cÃ³ sá»± giÃºp Ä‘á»¡ cá»§a giÃ¡o viÃªn mÃ  tÃ´i Ä‘Ã£ Ä‘á»— ká»³ thi nÄƒng lá»±c tiáº¿ng Nháº­t.',
      exampleAnswerJa: 'å…ˆç”Ÿã®ãŠã‹ã’ã§ã€æ—¥æœ¬èªžèƒ½åŠ›è©¦é¨“ã«åˆæ ¼ã™ã‚‹ã“ã¨ãŒã§ãã¾ã—ãŸã€‚',
      targetVocabulary: ['å…ˆç”Ÿ (ã›ã‚“ã›ã„)', 'è©¦é¨“ (ã—ã‘ã‚“)', 'åˆæ ¼ã™ã‚‹ (ã”ã†ã‹ãã™ã‚‹)'],
      targetGrammar: ['ï½žãŠã‹ã’ã§', 'ï½žã“ã¨ãŒã§ãã‚‹'],
      difficulty: 'N3',
      hintVi: 'Nhá» vÃ o (káº¿t quáº£ tÃ­ch cá»±c): [Danh tá»« + ã®] + ãŠã‹ã’ã§.'
    },
    {
      sentenceVi: 'DÃ¹ cÃ´ng viá»‡c báº­n rá»™n Ä‘áº¿n máº¥y, tÃ´i váº«n cá»‘ gáº¯ng há»c tiáº¿ng Nháº­t má»—i ngÃ y.',
      exampleAnswerJa: 'ã©ã‚“ãªã«ä»•äº‹ãŒå¿™ã—ãã¦ã‚‚ã€æ¯Žæ—¥æ—¥æœ¬èªžã‚’å‹‰å¼·ã™ã‚‹ã‚ˆã†ã«ã—ã¦ã„ã¾ã™ã€‚',
      targetVocabulary: ['ä»•äº‹ (ã—ã”ã¨)', 'å¿™ã—ã„ (ã„ããŒã—ã„)', 'å‹‰å¼·ã™ã‚‹ (ã¹ã‚“ãã‚‡ã†ã™ã‚‹)'],
      targetGrammar: ['ã©ã‚“ãªã«ï½žã¦ã‚‚', 'ï½žã‚ˆã†ã«ã—ã¦ã„ã‚‹'],
      difficulty: 'N3',
      hintVi: 'Duy trÃ¬ thÃ³i quen/cá»‘ gáº¯ng Ä‘á»u Ä‘áº·n: [Äá»™ng tá»« thá»ƒ tá»« Ä‘iá»ƒn] + ã‚ˆã†ã«ã—ã¦ã„ã‚‹.'
    },
    {
      sentenceVi: 'So vá»›i nÄƒm ngoÃ¡i, tiáº¿ng Nháº­t cá»§a báº¡n Ä‘Ã£ trá»Ÿ nÃªn trÃ´i cháº£y hÆ¡n nhiá»u.',
      exampleAnswerJa: 'åŽ»å¹´ã«æ¯”ã¹ã¦ã€æ—¥æœ¬èªžãŒãšã£ã¨ä¸Šæ‰‹ã«ãªã‚Šã¾ã—ãŸã­ã€‚',
      targetVocabulary: ['åŽ»å¹´ (ãã‚‡ã­ã‚“)', 'ä¸Šæ‰‹ (ã˜ã‚‡ã†ãš)', 'æ—¥æœ¬èªž (ã«ã»ã‚“ã”)'],
      targetGrammar: ['ï½žã«æ¯”ã¹ã¦', 'ï½žã‚ˆã†ã«ãªã‚‹ / ï½žããªã‚‹'],
      difficulty: 'N3',
      hintVi: 'So vá»›i: [Danh tá»«] + ã«æ¯”ã¹ã¦.'
    },
    {
      sentenceVi: 'Trong lÃºc Ä‘ang náº¥u Äƒn thÃ¬ cÃ³ Ä‘iá»‡n thoáº¡i gá»i Ä‘áº¿n tá»« cÃ´ng ty.',
      exampleAnswerJa: 'æ–™ç†ã‚’ä½œã£ã¦ã„ã‚‹æœ€ä¸­ã«ã€ä¼šç¤¾ã‹ã‚‰é›»è©±ãŒã‹ã‹ã£ã¦ãã¾ã—ãŸã€‚',
      targetVocabulary: ['æ–™ç† (ã‚Šã‚‡ã†ã‚Š)', 'ä¼šç¤¾ (ã‹ã„ã—ã‚ƒ)', 'é›»è©± (ã§ã‚“ã‚)'],
      targetGrammar: ['ï½žæœ€ä¸­ã« (ã•ã„ã¡ã‚…ã†ã«)'],
      difficulty: 'N3',
      hintVi: 'ÄÃºng lÃºc Ä‘ang lÃ m gÃ¬ thÃ¬ cÃ³ sá»± viá»‡c báº¥t ngá» xen vÃ o: [V-ã¦ã„ã‚‹] + æœ€ä¸­ã«.'
    }
  ],
  N2: [
    {
      sentenceVi: 'KhÃ´ng chá»‰ giá»i tiáº¿ng Anh mÃ  anh áº¥y cÃ²n cÃ³ thá»ƒ nÃ³i thÃ´ng tháº¡o cáº£ tiáº¿ng Nháº­t.',
      exampleAnswerJa: 'å½¼ã¯è‹±èªžãŒè©±ã›ã‚‹ã ã‘ã§ãªãã€æ—¥æœ¬èªžã‚‚æµæš¢ã«è©±ã™ã“ã¨ãŒã§ãã‚‹ã€‚',
      targetVocabulary: ['è‹±èªž (ãˆã„ã”)', 'æµæš¢ (ã‚Šã‚…ã†ã¡ã‚‡ã†)', 'è©±ã™ (ã¯ãªã™)'],
      targetGrammar: ['ï½žã ã‘ã§ãªãï½žã‚‚'],
      difficulty: 'N2',
      hintVi: 'KhÃ´ng nhá»¯ng... mÃ  cÃ²n...: [Thá»ƒ thÃ´ng thÆ°á»ng] + ã ã‘ã§ãªãã€[Danh tá»«] + ã‚‚.'
    },
    {
      sentenceVi: 'Má»™t khi Ä‘Ã£ há»©a vá»›i khÃ¡ch hÃ ng thÃ¬ tuyá»‡t Ä‘á»‘i khÃ´ng Ä‘Æ°á»£c phÃ©p tháº¥t há»©a.',
      exampleAnswerJa: 'ä¸€åº¦ãŠå®¢æ§˜ã¨ç´„æŸã—ãŸã‹ã‚‰ã«ã¯ã€çµ¶å¯¾ã«å®ˆã‚‰ãªã‘ã‚Œã°ãªã‚‰ãªã„ã€‚',
      targetVocabulary: ['ãŠå®¢æ§˜ (ãŠãã‚ƒãã•ã¾)', 'ç´„æŸ (ã‚„ããã)', 'å®ˆã‚‹ (ã¾ã‚‚ã‚‹)'],
      targetGrammar: ['ï½žã‹ã‚‰ã«ã¯'],
      difficulty: 'N2',
      hintVi: 'Má»™t khi Ä‘Ã£...: [Äá»™ng tá»« thá»ƒ thÃ´ng thÆ°á»ng] + ã‹ã‚‰ã«ã¯.'
    },
    {
      sentenceVi: 'CÃ¹ng vá»›i sá»± phÃ¡t triá»ƒn cá»§a cÃ´ng nghá»‡ AI, cÃ¡ch lÃ m viá»‡c cá»§a con ngÆ°á»i Ä‘ang thay Ä‘á»•i lá»›n.',
      exampleAnswerJa: 'AIæŠ€è¡“ã®ç™ºå±•ã«ä¼´ã£ã¦ã€äººã€…ã®åƒãæ–¹ãŒå¤§ããå¤‰ã‚ã‚Šã¤ã¤ã‚ã‚‹ã€‚',
      targetVocabulary: ['ç™ºå±• (ã¯ã£ã¦ã‚“)', 'åƒãæ–¹ (ã¯ãŸã‚‰ãã‹ãŸ)', 'å¤‰ã‚ã‚‹ (ã‹ã‚ã‚‹)'],
      targetGrammar: ['ï½žã«ä¼´ã£ã¦', 'ï½žã¤ã¤ã‚ã‚‹'],
      difficulty: 'N2',
      hintVi: 'CÃ¹ng vá»›i sá»± biáº¿n Ä‘á»•i: [Danh tá»«] + ã«ä¼´ã£ã¦ vÃ  Ä‘ang dáº§n chuyá»ƒn biáº¿n: [V-bá» ã¾ã™] + ã¤ã¤ã‚ã‚‹.'
    }
  ],
  N1: [
    {
      sentenceVi: 'DÃ¹ biáº¿t rÃµ sáº½ gáº·p nhiá»u khÃ³ khÄƒn nhÆ°ng anh áº¥y váº«n quyáº¿t tÃ¢m khá»Ÿi nghiá»‡p.',
      exampleAnswerJa: 'å¤šãã®å›°é›£ãŒã‚ã‚‹ã“ã¨ã‚’çŸ¥ã‚Šã¤ã¤ã‚‚ã€å½¼ã¯èµ·æ¥­ã™ã‚‹æ±ºæ„ã‚’å›ºã‚ãŸã€‚',
      targetVocabulary: ['å›°é›£ (ã“ã‚“ãªã‚“)', 'èµ·æ¥­ (ããŽã‚‡ã†)', 'æ±ºæ„ (ã‘ã¤ã„)'],
      targetGrammar: ['ï½žã¤ã¤ã‚‚'],
      difficulty: 'N1',
      hintVi: 'Máº·c dÃ¹ biáº¿t/lÃ m A nhÆ°ng váº«n B: [Äá»™ng tá»« bá» ã¾ã™] + ã¤ã¤(ã‚‚).'
    },
    {
      sentenceVi: 'ThÃ nh cÃ´ng cá»§a dá»± Ã¡n nÃ y khÃ´ng thá»ƒ cÃ³ Ä‘Æ°á»£c náº¿u thiáº¿u sá»± há»£p tÃ¡c cá»§a toÃ n bá»™ cÃ¡c thÃ nh viÃªn.',
      exampleAnswerJa: 'ã“ã®ãƒ—ãƒ­ã‚¸ã‚§ã‚¯ãƒˆã®æˆåŠŸã¯ã€ãƒ¡ãƒ³ãƒãƒ¼å…¨å“¡ã®å”åŠ›ãªã—ã«ã¯ã‚ã‚Šå¾—ãªã‹ã£ãŸã€‚',
      targetVocabulary: ['æˆåŠŸ (ã›ã„ã“ã†)', 'å”åŠ› (ãã‚‡ã†ã‚Šã‚‡ã)', 'ã‚ã‚Šå¾—ã‚‹ (ã‚ã‚Šãˆã‚‹)'],
      targetGrammar: ['ï½žãªã—ã«ã¯ï½žãªã„'],
      difficulty: 'N1',
      hintVi: 'Náº¿u khÃ´ng cÃ³ A thÃ¬ khÃ´ng thá»ƒ B: [Danh tá»«] + ãªã—ã«ã¯ + [Phá»§ Ä‘á»‹nh].'
    }
  ]
};

const levelIndices: Record<string, number> = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };

function getNextLocalQuestion(level: string, currentSentenceVi?: string): PracticeQuestion {
  const key = LOCAL_PRACTICE_BANK[level] ? level : 'N4';
  const pool = LOCAL_PRACTICE_BANK[key];
  let idx = levelIndices[key] ?? 0;
  let candidate = pool[idx % pool.length];
  if (currentSentenceVi && pool.length > 1 && candidate.sentenceVi === currentSentenceVi) {
    idx++;
    candidate = pool[idx % pool.length];
  }
  levelIndices[key] = idx + 1;
  return candidate;
}

function normalizeJa(text: string): string {
  return text.replace(/[\sã€‚ã€ï¼ï¼Ÿ!?,\\.ã€Œã€ã€Žã€ï¼ˆï¼‰()]/g, '');
}

function computeBigramSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) {
    return s1.includes(s2) || s2.includes(s1) ? 0.5 : 0;
  }
  const b1: string[] = [];
  for (let i = 0; i < s1.length - 1; i++) b1.push(s1.slice(i, i + 2));
  const b2: string[] = [];
  for (let i = 0; i < s2.length - 1; i++) b2.push(s2.slice(i, i + 2));
  const copy2 = [...b2];
  let matches = 0;
  for (const bg of b1) {
    const pos = copy2.indexOf(bg);
    if (pos !== -1) {
      matches++;
      copy2.splice(pos, 1);
    }
  }
  return (2 * matches) / (b1.length + b2.length);
}

export function evaluateLocally(userAnswer: string, question: PracticeQuestion): EvaluationResult {
  const expected = question.exampleAnswerJa;
  const actual = userAnswer.trim();
  const normExpected = normalizeJa(expected);
  const normActual = normalizeJa(actual);

  if (normActual && normActual === normExpected) {
    return {
      correct: true,
      score: 100,
      meaningScore: 100,
      grammarScore: 100,
      naturalnessScore: 98,
      grammarErrors: [],
      vocabularyErrors: [],
      suggestedAnswer: expected,
      explanationVi:
        'Xuáº¥t sáº¯c! CÃ¢u dá»‹ch tiáº¿ng Nháº­t cá»§a báº¡n hoÃ n toÃ n chÃ­nh xÃ¡c cáº£ vá» Ã½ nghÄ©a, ngá»¯ phÃ¡p láº«n cÃ¡ch diá»…n Ä‘áº¡t tá»± nhiÃªn cá»§a ngÆ°á»i báº£n xá»©.'
    };
  }

  const charSim = computeBigramSimilarity(normExpected, normActual);
  const vocabularyErrors: string[] = [];
  const grammarErrors: string[] = [];

  let vocabMatched = 0;
  for (const vTag of question.targetVocabulary) {
    const head = vTag.split('(')[0].trim().replace(/ã™ã‚‹$/, '');
    const readingMatch = vTag.match(/\(([^)]+)\)/);
    const reading = readingMatch ? readingMatch[1].trim() : '';
    const stem = head.length > 1 ? head.slice(0, -1) : head;
    if (actual.includes(head) || actual.includes(stem) || (reading && actual.includes(reading))) {
      vocabMatched++;
    } else {
      vocabularyErrors.push(`ChÆ°a sá»­ dá»¥ng hoáº·c viáº¿t sai tá»« vá»±ng má»¥c tiÃªu: ã€Œ${vTag}ã€`);
    }
  }

  let grammarMatched = 0;
  for (const gTag of question.targetGrammar) {
    const cleaned = gTag.replace('ï½ž', '').replace(/\(.*?\)/g, '').split('/')[0].trim();
    const core = cleaned.length > 4 ? cleaned.slice(0, 4) : cleaned;
    if (core && actual.includes(core)) {
      grammarMatched++;
    } else {
      grammarErrors.push(`Cáº§n Ã¡p dá»¥ng Ä‘Ãºng máº«u ngá»¯ phÃ¡p má»¥c tiÃªu: ã€Œ${gTag}ã€`);
    }
  }

  if (expected.includes('ã‚’') && !actual.includes('ã‚’') && actual.length > 4) {
    grammarErrors.push('Thiáº¿u trá»£ tá»« ã€Œã‚’ã€ chá»‰ tÃ¢n ngá»¯ trá»±c tiáº¿p cá»§a hÃ nh Ä‘á»™ng.');
  }

  const vocabRatio = question.targetVocabulary.length > 0 ? vocabMatched / question.targetVocabulary.length : charSim;
  const grammarRatio = question.targetGrammar.length > 0 ? grammarMatched / question.targetGrammar.length : charSim;

  let meaningScore = Math.round(Math.min(100, Math.max(25, vocabRatio * 65 + charSim * 35)));
  let grammarScore = Math.round(Math.min(100, Math.max(20, grammarRatio * 65 + charSim * 35)));
  let naturalnessScore = Math.round(Math.min(100, Math.max(25, charSim * 75 + grammarRatio * 25)));

  if (charSim >= 0.72) {
    meaningScore = Math.max(meaningScore, 88);
    grammarScore = Math.max(grammarScore, 85);
    naturalnessScore = Math.max(naturalnessScore, 84);
  }

  const score = Math.round(meaningScore * 0.4 + grammarScore * 0.4 + naturalnessScore * 0.2);
  const correct = score >= 70;

  let explanationVi = '';
  if (score >= 90) {
    explanationVi = 'CÃ¢u dá»‹ch cá»§a báº¡n ráº¥t chuáº©n xÃ¡c vÃ  tá»± nhiÃªn! Báº¡n Ä‘Ã£ váº­n dá»¥ng tá»‘t cáº£ tá»« vá»±ng láº«n cáº¥u trÃºc ngá»¯ phÃ¡p má»¥c tiÃªu cá»§a cÃ¢u.';
  } else if (correct) {
    explanationVi =
      'CÃ¢u cá»§a báº¡n diá»…n Ä‘áº¡t Ä‘Ãºng Ã½ chÃ­nh vÃ  cáº¥u trÃºc trá»ng tÃ¢m! HÃ£y lÆ°u Ã½ cÃ¡c Ä‘iá»ƒm gÃ³p Ã½ bÃªn dÆ°á»›i Ä‘á»ƒ cÃ¢u vÄƒn tá»± nhiÃªn nhÆ° ngÆ°á»i báº£n xá»© hÆ¡n.';
  } else {
    explanationVi = `CÃ¢u tráº£ lá»i cá»§a báº¡n chÆ°a khá»›p vá»›i cáº¥u trÃºc hoáº·c tá»« vá»±ng yÃªu cáº§u. ${
      question.hintVi ? question.hintVi + ' ' : ''
    }HÃ£y Ä‘á»‘i chiáº¿u vá»›i Ä‘Ã¡p Ã¡n chuáº©n ã€Œ${expected}ã€ vÃ  thá»­ láº¡i nhÃ©!`;
  }

  return {
    correct,
    score,
    meaningScore,
    grammarScore,
    naturalnessScore,
    grammarErrors,
    vocabularyErrors,
    suggestedAnswer: expected,
    explanationVi
  };
}

export const api = {
  // Vocabulary APIs
  getVocabularies: async (): Promise<Vocabulary[]> => {
    try {
      const res = await fetch(`${BASE_URL}/vocabularies`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [
        { id: 1, word: 'æ˜ ç”»', reading: 'ãˆã„ãŒ', meaningVi: 'Bá»™ phim', jlptLevel: 'N4', partOfSpeech: 'Danh tá»«' },
        { id: 2, word: 'è¦‹ã‚‹', reading: 'ã¿ã‚‹', meaningVi: 'Xem / NhÃ¬n', jlptLevel: 'N5', partOfSpeech: 'Äá»™ng tá»« nhÃ³m 2' },
        { id: 3, word: 'å‹é”', reading: 'ã¨ã‚‚ã ã¡', meaningVi: 'Báº¡n bÃ¨', jlptLevel: 'N5', partOfSpeech: 'Danh tá»«' }
      ];
    }
  },

  createVocabulary: async (vocab: Vocabulary): Promise<Vocabulary> => {
    const res = await fetch(`${BASE_URL}/vocabularies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vocab)
    });
    return await res.json();
  },

  deleteVocabulary: async (id: number): Promise<void> => {
    await fetch(`${BASE_URL}/vocabularies/${id}`, {
      method: 'DELETE'
    });
  },

  // Grammar APIs
  getGrammars: async (): Promise<Grammar[]> => {
    try {
      const res = await fetch(`${BASE_URL}/grammars`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [
        { id: 1, pattern: 'ï½žãŸã“ã¨ãŒã‚ã‚‹', meaningVi: 'ÄÃ£ tá»«ng lÃ m gÃ¬', structure: 'V-ãŸ + ã“ã¨ãŒã‚ã‚‹', jlptLevel: 'N4' },
        { id: 2, pattern: 'ï½žã¤ã‚‚ã‚Šã§ã™', meaningVi: 'Dá»± Ä‘á»‹nh lÃ m gÃ¬', structure: 'V-plain + ã¤ã‚‚ã‚Šã§ã™', jlptLevel: 'N4' }
      ];
    }
  },

  createGrammar: async (grammar: Partial<Grammar>): Promise<Grammar> => {
    try {
      const res = await fetch(`${BASE_URL}/grammars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grammar)
      });
      return await res.json();
    } catch {
      return { id: Date.now(), pattern: grammar.pattern || '', meaningVi: grammar.meaningVi || '', structure: grammar.structure || '', jlptLevel: grammar.jlptLevel || 'N4' };
    }
  },

  deleteGrammar: async (id: number): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/grammars/${id}`, {
        method: 'DELETE'
      });
    } catch {
      console.log('Deleted offline grammar', id);
    }
  },

  // Practice APIs
  generatePractice: async (level: string = 'N4', currentSentenceVi?: string): Promise<PracticeQuestion> => {
    try {
      const res = await fetch(`${BASE_URL}/practice/generate?level=${level}`, { method: 'POST' });
      if (res.ok) {
        const data: PracticeQuestion = await res.json();
        const isLegacyBrokenMock =
          data.sentenceVi.includes('bá»™ phim') &&
          data.targetVocabulary.some((v) => v.includes('ç´„æŸ'));
        const isDuplicate = currentSentenceVi && data.sentenceVi === currentSentenceVi;
        if (!isLegacyBrokenMock && !isDuplicate) {
          return data;
        }
      }
    } catch {
      // Fallback to curated local bank
    }
    return getNextLocalQuestion(level, currentSentenceVi);
  },

  evaluatePractice: async (userAnswer: string, question: PracticeQuestion): Promise<EvaluationResult> => {
    try {
      const res = await fetch(`${BASE_URL}/practice/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentenceVi: question.sentenceVi,
          exampleAnswerJa: question.exampleAnswerJa,
          userAnswer,
          targetVocabulary: question.targetVocabulary,
          targetGrammar: question.targetGrammar,
          difficulty: question.difficulty
        })
      });
      if (res.ok) {
        const data: EvaluationResult = await res.json();
        if (data.grammarErrors !== undefined) {
          return data;
        }
      }
    } catch {
      // Fallback to local linguistic evaluator
    }
    return evaluateLocally(userAnswer, question);
  },

  // Kaiwa APIs
  sendKaiwaMessage: async (userMessage: string, level: string = 'N4'): Promise<{ aiReply: string; correctionVi?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/kaiwa/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage, level })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback response
    }
    return {
      aiReply: 'äº¬éƒ½ã¸è¡Œã£ãŸã“ã¨ãŒã‚ã‚Šã¾ã™ã‹ã€‚ã¨ã¦ã‚‚ãã‚Œã„ãªè¡—ã§ã™ã‚ˆã€‚',
      correctionVi: 'CÃ¢u cá»§a báº¡n khÃ¡ tá»‘t! AI gá»£i Ã½ tá»± nhiÃªn hÆ¡n: ã€Œï½žã¸è¡Œã£ãŸã“ã¨ãŒã‚ã‚Šã¾ã™ã‹ã€ sá»­ dá»¥ng tá»« vá»±ng Ä‘Ã£ há»c äº¬éƒ½.'
    };
  },

  // Settings APIs
  getSettings: async (): Promise<Record<string, string>> => {
    try {
      const res = await fetch(`${BASE_URL}/settings`);
      if (!res.ok) return {};
      const list: Array<{ settingKey: string; settingValue: string }> = await res.json();
      const map: Record<string, string> = {};
      list.forEach((item) => {
        map[item.settingKey] = item.settingValue;
      });
      return map;
    } catch {
      return {};
    }
  },

  saveSetting: async (key: string, value: string): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
    } catch (e) {
      console.warn('Failed to save setting to backend:', e);
    }
  },

  // AI Kanji & Word Lookup
  lookupKanjiAi: async (word: string): Promise<{
    word: string;
    reading: string;
    sinoVietnamese: string;
    meaningVi: string;
    jlptLevel?: string;
    kanjiList?: Array<{ charStr?: string; char?: string; sino: string; meaning: string }>;
  } | null> => {
    try {
      const res = await fetch(`${BASE_URL}/practice/lookup-kanji?word=${encodeURIComponent(word)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('AI Kanji lookup failed:', e);
    }
    return null;
  },

  // Grammar Anki SRS APIs
  getGrammarStudySession: async (level: string = 'ALL', limit: number = 5): Promise<any[]> => {
    try {
      const res = await fetch(`${BASE_URL}/grammars/study-session?level=${encodeURIComponent(level)}&limit=${limit}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to load grammar study session:', e);
    }
    return [];
  },

  submitGrammarReview: async (id: number, rating: string): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/grammars/${id}/review?rating=${encodeURIComponent(rating)}`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to submit grammar review:', e);
    }
    return null;
  }
};