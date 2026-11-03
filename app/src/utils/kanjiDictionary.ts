/**
 * Kanji & Sino-Vietnamese (Hán Việt) Offline Dictionary
 * Provides instant (<1ms) lookup for Kanji characters, Sino-Vietnamese readings,
 * root forms (deconjugation), and Vietnamese meanings.
 */

export interface KanjiDetail {
  char: string;
  sino: string;
  meaning: string;
}

export interface LookupResult {
  query: string;
  word: string;
  reading: string;
  sinoVietnamese: string;
  meaningVi: string;
  kanjiList: KanjiDetail[];
  rootForm?: string;
  conjugationNote?: string;
}

// 1. Comprehensive Jouyou & JLPT Kanji -> Sino-Vietnamese Mapping
export const KANJI_SINO_MAP: Record<string, { sino: string; meaning: string }> = {
  // N5 / N4 Basic & Healthcare
  '医': { sino: 'Y', meaning: 'y học, thầy thuốc' },
  '者': { sino: 'GIẢ', meaning: 'người, kẻ' },
  '痛': { sino: 'THỐNG', meaning: 'đau đớn, nhức nhối' },
  '病': { sino: 'BỆNH', meaning: 'bệnh tật, ốm đau' },
  '院': { sino: 'VIỆN', meaning: 'học viện, bệnh viện' },
  '薬': { sino: 'DƯỢC', meaning: 'thuốc men' },
  '熱': { sino: 'NHIỆT', meaning: 'sốt, nóng, nhiệt độ' },
  '体': { sino: 'THỂ', meaning: 'cơ thể, thân thể' },
  '頭': { sino: 'ĐẦU', meaning: 'cái đầu' },
  '目': { sino: 'MỤC', meaning: 'mắt, cái nhìn' },
  '耳': { sino: 'NHĨ', meaning: 'tai, lỗ tai' },
  '口': { sino: 'KHẨU', meaning: 'miệng, cửa' },
  '手': { sino: 'THỦ', meaning: 'tay, bàn tay' },
  '足': { sino: 'TÚC', meaning: 'chân, đầy đủ' },
  '心': { sino: 'TÂM', meaning: 'tim, tấm lòng' },
  '私': { sino: 'TƯ', meaning: 'tôi, cá nhân, riêng tư' },
  '彼': { sino: 'BỈ', meaning: 'anh ấy, người kia' },

  // Time & Days
  '来': { sino: 'LAI', meaning: 'đến, tới, tương lai' },
  '週': { sino: 'CHU', meaning: 'tuần lễ' },
  '末': { sino: 'MẠT', meaning: 'cuối, ngọn' },
  '年': { sino: 'NIÊN', meaning: 'năm, tuổi' },
  '月': { sino: 'NGUYỆT', meaning: 'tháng, mặt trăng' },
  '日': { sino: 'NHẬT', meaning: 'ngày, mặt trời' },
  '時': { sino: 'THỜI', meaning: 'thời gian, giờ' },
  '間': { sino: 'GIAN', meaning: 'ở giữa, khoảng cách' },
  '分': { sino: 'PHÂN', meaning: 'phút, phân chia, hiểu' },
  '今': { sino: 'KIM', meaning: 'bây giờ, hiện tại' },
  '朝': { sino: 'TRIÊU', meaning: 'buổi sáng' },
  '昼': { sino: 'TRÚ', meaning: 'buổi trưa' },
  '晩': { sino: 'VÃN', meaning: 'buổi tối' },
  '夜': { sino: 'DẠ', meaning: 'đêm, bóng tối' },
  '前': { sino: 'TIỀN', meaning: 'trước, phía trước' },
  '後': { sino: 'HẬU', meaning: 'sau, phía sau' },
  '昨': { sino: 'TÁC', meaning: 'hôm qua, đã qua' },
  '夏': { sino: 'HẠ', meaning: 'mùa hè' },
  '春': { sino: 'XUÂN', meaning: 'mùa xuân' },
  '秋': { sino: 'THU', meaning: 'mùa thu' },
  '冬': { sino: 'ĐÔNG', meaning: 'mùa đông' },
  '休': { sino: 'HƯU', meaning: 'nghỉ ngơi, ngừng' },

  // Actions & Verbs
  '行': { sino: 'HÀNH', meaning: 'đi, thực hiện' },
  '見': { sino: 'KIẾN', meaning: 'nhìn, xem, thấy' },
  '聞': { sino: 'VĂN', meaning: 'nghe, hỏi' },
  '食': { sino: 'THỰC', meaning: 'ăn, ẩm thực' },
  '飲': { sino: 'ẨM', meaning: 'uống' },
  '買': { sino: 'MÃI', meaning: 'mua' },
  '売': { sino: 'MẠI', meaning: 'bán' },
  '書': { sino: 'THƯ', meaning: 'viết, sách' },
  '読': { sino: 'ĐỘC', meaning: 'đọc' },
  '話': { sino: 'THOẠI', meaning: 'nói chuyện, câu chuyện' },
  '言': { sino: 'NGÔN', meaning: 'nói, lời nói' },
  '語': { sino: 'NGỮ', meaning: 'ngôn ngữ, tiếng' },
  '立': { sino: 'LẬP', meaning: 'đứng, thành lập' },
  '座': { sino: 'TỌA', meaning: 'ngồi, chỗ ngồi' },
  '出': { sino: 'XUẤT', meaning: 'ra, xuất hiện' },
  '入': { sino: 'NHẬP', meaning: 'vào, nhập' },
  '会': { sino: 'HỘI', meaning: 'gặp gỡ, hội họp' },
  '待': { sino: 'ĐÃI', meaning: 'chờ đợi, đối đãi' },
  '持': { sino: 'TRÌ', meaning: 'cầm, mang, nắm giữ' },
  '起': { sino: 'KHỞI', meaning: 'thức dậy, khởi hành' },
  '寝': { sino: 'TẨM', meaning: 'ngủ' },
  '帰': { sino: 'QUY', meaning: 'về, quay lại' },
  '走': { sino: 'TẨU', meaning: 'chạy' },
  '歩': { sino: 'BỘ', meaning: 'đi bộ, từng bước' },
  '働': { sino: 'ĐỘNG', meaning: 'làm việc, lao động' },
  '作': { sino: 'TÁC', meaning: 'làm, chế tạo' },
  '使': { sino: 'SỬ', meaning: 'dùng, sử dụng' },
  '知': { sino: 'TRI', meaning: 'biết, tri thức' },
  '思': { sino: 'TƯ', meaning: 'nghĩ, suy ngẫm' },
  '忘': { sino: 'VONG', meaning: 'quên' },
  '習': { sino: 'TẬP', meaning: 'học tập, rèn luyện' },
  '教': { sino: 'GIÁO', meaning: 'dạy, chỉ dẫn, tôn giáo' },
  '勉': { sino: 'MIỄN', meaning: 'cố gắng, nỗ lực' },
  '強': { sino: 'CƯỜNG', meaning: 'mạnh mẽ, bắt buộc' },
  '試': { sino: 'THÍ', meaning: 'thử, thi' },
  '験': { sino: 'NGHIỆM', meaning: 'kiểm tra, thử nghiệm' },
  '合': { sino: 'HỢP', meaning: 'phù hợp, tập hợp' },
  '格': { sino: 'CÁCH', meaning: 'quy cách, tư cách' },

  // People, Places & Society
  '友': { sino: 'HỮU', meaning: 'bạn bè' },
  '達': { sino: 'ĐẠT', meaning: 'thành đạt, đạt tới, số nhiều' },
  '先': { sino: 'TIÊN', meaning: 'trước, tiên sinh' },
  '生': { sino: 'SINH', meaning: 'sống, sinh ra, học sinh' },
  '学': { sino: 'HỌC', meaning: 'học hành, trường học' },
  '校': { sino: 'HIỆU', meaning: 'trường học' },
  '社': { sino: 'XÃ', meaning: 'công ty, xã hội' },
  '員': { sino: 'VIÊN', meaning: 'thành viên, nhân viên' },
  '店': { sino: 'ĐIẾM', meaning: 'cửa hàng, tiệm' },
  '駅': { sino: 'DỊCH', meaning: 'nhà ga' },
  '銀': { sino: 'NGÂN', meaning: 'bạc, ngân hàng' },
  '町': { sino: 'ĐINH', meaning: 'khu phố, thị trấn' },
  '国': { sino: 'QUỐC', meaning: 'đất nước, quốc gia' },
  '京': { sino: 'KINH', meaning: 'kinh đô, thủ đô' },
  '都': { sino: 'ĐÔ', meaning: 'thành đô, thủ đô' },
  '本': { sino: 'BẢN', meaning: 'gốc, sách, nước Nhật' },
  '山': { sino: 'SƠN', meaning: 'núi' },
  '川': { sino: 'XUYÊN', meaning: 'sông' },
  '花': { sino: 'HOA', meaning: 'hoa, bông hoa' },
  '魚': { sino: 'NGƯ', meaning: 'cá' },
  '肉': { sino: 'NHỤC', meaning: 'thịt' },
  '茶': { sino: 'TRÀ', meaning: 'trà, nước chè' },
  '酒': { sino: 'TỬU', meaning: 'rượu' },
  '水': { sino: 'THỦY', meaning: 'nước' },
  '火': { sino: 'HỎA', meaning: 'lửa, thứ ba' },
  '木': { sino: 'MỘC', meaning: 'cây cối, thứ năm' },
  '金': { sino: 'KIM', meaning: 'vàng, tiền bạc, thứ sáu' },
  '土': { sino: 'THỔ', meaning: 'đất đai, thứ bảy' },
  '雨': { sino: 'VŨ', meaning: 'mưa' },
  '電': { sino: 'ĐIỆN', meaning: 'điện lực' },
  '車': { sino: 'XA', meaning: 'xe cộ' },
  '道': { sino: 'ĐẠO', meaning: 'con đường, đạo lý' },
  '天': { sino: 'THIÊN', meaning: 'trời, thời tiết' },
  '気': { sino: 'KHÍ', meaning: 'không khí, khí sắc, tinh thần' },
  '映': { sino: 'ÁNH', meaning: 'chiếu, phản chiếu' },
  '画': { sino: 'HỌA', meaning: 'tranh vẽ, bức tranh' },
  '約': { sino: 'ƯỚC', meaning: 'lời hứa, ước chừng' },
  '束': { sino: 'THÚC', meaning: 'bó, buộc lại' },
  '料': { sino: 'LIỆU', meaning: 'nguyên liệu, tiền phí' },
  '理': { sino: 'LÍ', meaning: 'lý lẽ, xử lý' },
  '事': { sino: 'SỰ', meaning: 'việc, sự việc' },
  '物': { sino: 'VẬT', meaning: 'đồ vật, sự vật' },
  '運': { sino: 'VẬN', meaning: 'vận mệnh, vận chuyển' },
  '動': { sino: 'ĐỘNG', meaning: 'chuyển động, cử động' },
  '野': { sino: 'DÃ', meaning: 'đồng cỏ, hoang dã' },
  '菜': { sino: 'THÁI', meaning: 'rau củ' },
  '旅': { sino: 'LỮ', meaning: 'du lịch, chuyến đi' },

  // Adjectives & Modifiers
  '大': { sino: 'ĐẠI', meaning: 'to, lớn' },
  '小': { sino: 'TIỂU', meaning: 'nhỏ, bé' },
  '高': { sino: 'CAO', meaning: 'cao, đắt' },
  '安': { sino: 'AN', meaning: 'rẻ, an toàn, yên ổn' },
  '新': { sino: 'TÂN', meaning: 'mới' },
  '古': { sino: 'CỔ', meaning: 'cũ, xưa' },
  '長': { sino: 'TRƯỜNG', meaning: 'dài, thủ trưởng' },
  '短': { sino: 'ĐOẢN', meaning: 'ngắn' },
  '多': { sino: 'ĐA', meaning: 'nhiều' },
  '少': { sino: 'THIỂU', meaning: 'ít, một chút' },
  '早': { sino: 'TẢO', meaning: 'sớm, nhanh' },
  '近': { sino: 'CẬN', meaning: 'gần' },
  '遠': { sino: 'VIỄN', meaning: 'xa' },
  '白': { sino: 'BẠCH', meaning: 'màu trắng' },
  '黒': { sino: 'HẮC', meaning: 'màu đen' },
  '赤': { sino: 'XÍCH', meaning: 'màu đỏ' },
  '青': { sino: 'THANH', meaning: 'màu xanh' },
  '切': { sino: 'THIẾT', meaning: 'cắt, khẩn cấp' },
  '忙': { sino: 'MANG', meaning: 'bận rộn' },
  '暇': { sino: 'HẠ', meaning: 'rảnh rỗi' },
  '難': { sino: 'NAN', meaning: 'khó khăn' },
  '易': { sino: 'DỊCH', meaning: 'dễ dàng' },
  '困': { sino: 'KHỐN', meaning: 'khốn khổ, khó khăn' },
  '流': { sino: 'LƯU', meaning: 'dòng chảy, trôi' },
  '暢': { sino: 'SƯỚNG', meaning: 'thông suốt, trôi chảy' },
  '様': { sino: 'DẠNG', meaning: 'hình dạng, kính ngữ ngài/ông' }
};

// 2. Common Compound Expressions (Kanji words + Hiragana + Meaning)
export const COMMON_COMPOUNDS: Record<string, { reading: string; sino: string; meaning: string }> = {
  '医者': { reading: 'いしゃ', sino: 'Y GIẢ', meaning: 'Bác sĩ, thầy thuốc' },
  '病院': { reading: 'びょういん', sino: 'BỆNH VIỆN', meaning: 'Bệnh viện' },
  '痛い': { reading: 'いたい', sino: 'THỐNG', meaning: 'Đau, nhức buốt' },
  '頭痛': { reading: 'ずつう', sino: 'ĐẦU THỐNG', meaning: 'Chứng đau đầu' },
  '薬': { reading: 'くすり', sino: 'DƯỢC', meaning: 'Thuốc men' },
  '風邪': { reading: 'かぜ', sino: 'PHONG TÀ', meaning: 'Cảm cúm, cảm lạnh' },
  '熱': { reading: 'ねつ', sino: 'NHIỆT', meaning: 'Cơn sốt, độ nóng' },
  '来週': { reading: 'らいしゅう', sino: 'LAI CHU', meaning: 'Tuần sau, tuần tới' },
  '先週': { reading: 'せんしゅう', sino: 'TIÊN CHU', meaning: 'Tuần trước' },
  '今週': { reading: 'こんしゅう', sino: 'KIM CHU', meaning: 'Tuần này' },
  '週末': { reading: 'しゅうまつ', sino: 'CHU MẠT', meaning: 'Cuối tuần' },
  '来月': { reading: 'らいげつ', sino: 'LAI NGUYỆT', meaning: 'Tháng sau' },
  '先月': { reading: 'せんげつ', sino: 'TIÊN NGUYỆT', meaning: 'Tháng trước' },
  '今月': { reading: 'こんげつ', sino: 'KIM NGUYỆT', meaning: 'Tháng này' },
  '来年': { reading: 'らいねん', sino: 'LAI NIÊN', meaning: 'Năm sau' },
  '去年': { reading: 'きょねん', sino: 'KHỨ NIÊN', meaning: 'Năm ngoái' },
  '今年': { reading: 'ことし', sino: 'KIM NIÊN', meaning: 'Năm nay' },
  '明日': { reading: 'あした / あす', sino: 'MINH NHẬT', meaning: 'Ngày mai' },
  '昨日': { reading: 'きのう', sino: 'TÁC NHẬT', meaning: 'Hôm qua' },
  '今日': { reading: 'きょう', sino: 'KIM NHẬT', meaning: 'Hôm nay' },
  '今晩': { reading: 'こんばん', sino: 'KIM VÃN', meaning: 'Tối nay' },
  '毎朝': { reading: 'まいあさ', sino: 'MỖI TRIÊU', meaning: 'Mỗi buổi sáng' },
  '映画': { reading: 'えいが', sino: 'ÁNH HỌA', meaning: 'Bộ phim, điện ảnh' },
  '友達': { reading: 'ともだち', sino: 'HỮU ĐẠT', meaning: 'Bạn bè, người bạn' },
  '約束': { reading: 'やくそく', sino: 'ƯỚC THÚC', meaning: 'Lời hứa, cuộc hẹn' },
  '先生': { reading: 'せんせい', sino: 'TIÊN SINH', meaning: 'Thầy cô giáo, bác sĩ' },
  '学生': { reading: 'がくせい', sino: 'HỌC SINH', meaning: 'Học sinh, sinh viên' },
  '大学': { reading: 'だいがく', sino: 'ĐẠI HỌC', meaning: 'Trường đại học' },
  '仕事': { reading: 'しごと', sino: 'SĨ SỰ', meaning: 'Công việc' },
  '会社': { reading: 'かいしゃ', sino: 'HỘI XÃ', meaning: 'Công ty' },
  '料理': { reading: 'りょうり', sino: 'LIỆU LÍ', meaning: 'Món ăn, nấu ăn' },
  '時間': { reading: 'じかん', sino: 'THỜI GIAN', meaning: 'Thời gian, tiếng đồng hồ' },
  '大切': { reading: 'たいせつ', sino: 'ĐẠI THIẾT', meaning: 'Quan trọng, quý giá' },
  '夏休み': { reading: 'なつやすみ', sino: 'HẠ HƯU', meaning: 'Kỳ nghỉ hè' },
  '旅行': { reading: 'りょこう', sino: 'LỮ HÀNH', meaning: 'Chuyến du lịch' },
  '野菜': { reading: 'やさい', sino: 'DÃ THÁI', meaning: 'Rau củ' },
  '運動': { reading: 'うんどう', sino: 'VẬN ĐỘNG', meaning: 'Tập thể dục, vận động' },
  '試験': { reading: 'しけん', sino: 'THÍ NGHIỆM', meaning: 'Kỳ thi, bài kiểm tra' },
  '合格': { reading: 'ごうかく', sino: 'HỢP CÁCH', meaning: 'Thi đỗ, trúng tuyển' },
  '電車': { reading: 'でんしゃ', sino: 'ĐIỆN XA', meaning: 'Tàu điện' },
  '電話': { reading: 'でんわ', sino: 'ĐIỆN THOẠI', meaning: 'Điện thoại, cuộc gọi' },
  '京都': { reading: 'きょうと', sino: 'KINH ĐÔ', meaning: 'Thành phố Kyoto' },
  '日本': { reading: 'にほん', sino: 'NHẬT BẢN', meaning: 'Nước Nhật Bản' },
  '英語': { reading: 'えいご', sino: 'ANH NGỮ', meaning: 'Tiếng Anh' },
  '日本語': { reading: 'にほんご', sino: 'NHẬT BẢN NGỮ', meaning: 'Tiếng Nhật' },
  '流暢': { reading: 'りゅうちょう', sino: 'LƯU SƯỚNG', meaning: 'Lưu loát, trôi chảy' },
  'お客様': { reading: 'おきゃくさま', sino: 'KHÁCH DẠNG', meaning: 'Quý khách hàng' },
  '行く': { reading: 'いく', sino: 'HÀNH', meaning: 'Đi tới' },
  '来る': { reading: 'くる', sino: 'LAI', meaning: 'Đến tới' },
  '見る': { reading: 'みる', sino: 'KIẾN', meaning: 'Xem, nhìn' },
  '食べる': { reading: 'たべる', sino: 'THỰC', meaning: 'Ăn' },
  '飲む': { reading: 'のむ', sino: 'ẨM', meaning: 'Uống' },
  '買う': { reading: 'かう', sino: 'MÃI', meaning: 'Mua' },
  '起きる': { reading: 'おきる', sino: 'KHỞI', meaning: 'Thức dậy' },
  '習う': { reading: 'ならう', sino: 'TẬP', meaning: 'Học tập (kỹ năng, từ ai đó)' },
  '勉強する': { reading: 'べんきょうする', sino: 'MIỄN CƯỜNG', meaning: 'Học tập' }
};

// 3. Deconjugation patterns for Japanese Adjectives & Verbs
interface DeconjugationRule {
  suffix: string;
  replacement: string;
  note: string;
}

const DECONJUGATION_RULES: DeconjugationRule[] = [
  // I-adjectives (e.g. 痛かった -> 痛い)
  { suffix: 'かった', replacement: 'い', note: 'Thể quá khứ khẳng định' },
  { suffix: 'くない', replacement: 'い', note: 'Thể phủ định hiện tại' },
  { suffix: 'くなかった', replacement: 'い', note: 'Thể quá khứ phủ định' },
  { suffix: 'くて', replacement: 'い', note: 'Thể liên từ て' },

  // Verbs - Masu forms
  { suffix: 'ました', replacement: 'る', note: 'Thể lịch sự quá khứ' },
  { suffix: 'ません', replacement: 'る', note: 'Thể lịch sự phủ định' },
  { suffix: 'ます', replacement: 'る', note: 'Thể lịch sự hiện tại' },

  // Verbs - Te / Ta forms
  { suffix: 'ている', replacement: 'る', note: 'Thể đang diễn ra (V-ている)' },
  { suffix: 'ていた', replacement: 'る', note: 'Thể quá khứ tiếp diễn' },
  { suffix: 'て', replacement: 'る', note: 'Thể liên từ て' },
  { suffix: 'た', replacement: 'る', note: 'Thể quá khứ ngắn (V-た)' }
];

/**
 * Normalizes and removes punctuation from Japanese text selection
 */
function cleanSelection(text: string): string {
  return text.trim().replace(/[。、！？!?,\\.\s「」『』（）()]/g, '');
}

/**
 * Main lookup function: extracts Kanji breakdown, Sino-Vietnamese readings,
 * and matches compound or deconjugated words.
 */
export function lookupJapaneseWord(rawText: string): LookupResult | null {
  const query = cleanSelection(rawText);
  if (!query) return null;

  // Extract all Kanji characters in the selection
  const kanjiChars = query.match(/[\u4e00-\u9faf]/g) || [];
  const kanjiList: KanjiDetail[] = kanjiChars.map((ch) => {
    const entry = KANJI_SINO_MAP[ch];
    return {
      char: ch,
      sino: entry ? entry.sino : '---',
      meaning: entry ? entry.meaning : 'Chữ Hán'
    };
  });

  // Calculate default combined Sino-Vietnamese reading
  const defaultSino = kanjiList.map((k) => k.sino).filter((s) => s !== '---').join(' ');

  // Direct compound match
  if (COMMON_COMPOUNDS[query]) {
    const item = COMMON_COMPOUNDS[query];
    return {
      query,
      word: query,
      reading: item.reading,
      sinoVietnamese: item.sino || defaultSino,
      meaningVi: item.meaning,
      kanjiList
    };
  }

  // Deconjugation attempt (e.g. 痛かった -> 痛い, 行きます -> 行く)
  for (const rule of DECONJUGATION_RULES) {
    if (query.endsWith(rule.suffix)) {
      const stem = query.slice(0, -rule.suffix.length);
      const candidates = [
        stem + rule.replacement,
        stem + 'く', // e.g. 行きます -> 行く
        stem + 'む', // e.g. 飲みます -> 飲む
        stem + 'う', // e.g. 買います -> 買う
        stem + 'る'
      ];

      for (const candidate of candidates) {
        if (COMMON_COMPOUNDS[candidate]) {
          const item = COMMON_COMPOUNDS[candidate];
          return {
            query,
            word: candidate,
            reading: item.reading,
            sinoVietnamese: item.sino || defaultSino,
            meaningVi: item.meaning,
            kanjiList,
            rootForm: candidate,
            conjugationNote: rule.note
          };
        }
      }
    }
  }

  // If query is a single Kanji or contains Kanji with known readings
  if (kanjiList.length > 0) {
    const firstKanji = kanjiList[0];
    return {
      query,
      word: query,
      reading: '---',
      sinoVietnamese: defaultSino || firstKanji.sino,
      meaningVi: kanjiList.map((k) => `${k.char}: ${k.meaning}`).join('; '),
      kanjiList
    };
  }

  // Kana-only word without Kanji
  return {
    query,
    word: query,
    reading: query,
    sinoVietnamese: '(Từ thuần Nhật / Kana)',
    meaningVi: 'Từ vựng tiếng Nhật',
    kanjiList: []
  };
}
