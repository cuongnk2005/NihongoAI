package com.nihongoai.backend.ai;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class LocalMockAiProvider implements AiProvider {

    private final Map<String, AtomicInteger> levelCounters = new ConcurrentHashMap<>();

    private static final Map<String, List<PracticeQuestionDto>> EXERCISE_BANK = Map.of(
            "N5", List.of(
                    new PracticeQuestionDto(
                            "Mỗi sáng tôi đều uống cà phê rồi đi làm.",
                            "毎朝コーヒーを飲んでから会社へ行きます。",
                            List.of("毎朝 (まいあさ)", "飲む (のむ)", "会社 (かいしゃ)"),
                            List.of("～てから"),
                            "N5",
                            "Cấu trúc: [Động từ thể て] + から (Sau khi làm V1 thì làm V2)."
                    ),
                    new PracticeQuestionDto(
                            "Cuối tuần trước tôi đã đi xem phim cùng với bạn bè.",
                            "先週の週末、友達と映画を見に行きました。",
                            List.of("週末 (しゅうまつ)", "友達 (ともだち)", "映画 (えいが)"),
                            List.of("～に行く"),
                            "N5",
                            "Cấu trúc chỉ mục đích di chuyển: [V-bỏ ます] + に行く (Đi để làm gì)."
                    ),
                    new PracticeQuestionDto(
                            "Tối nay chúng ta cùng ăn món Nhật ở nhà hàng nhé?",
                            "今晩、レストランで日本料理を食べませんか。",
                            List.of("今晩 (こんばん)", "日本料理 (にほんりょうり)", "食べる (たべる)"),
                            List.of("～ませんか"),
                            "N5",
                            "Mẫu câu rủ rê lịch sự: [Động từ bỏ ます] + ませんか."
                    ),
                    new PracticeQuestionDto(
                            "Vì trời đang mưa nên tôi sẽ đi bằng tàu điện.",
                            "雨が降っていますから、電車で行きます。",
                            List.of("雨 (あめ)", "降る (ふる)", "電車 (でんしゃ)"),
                            List.of("～ています", "～から"),
                            "N5",
                            "Sử dụng 雨が降っています để diễn tả trời đang mưa và trợ từ で chỉ phương tiện."
                    ),
                    new PracticeQuestionDto(
                            "Tôi muốn mua một chiếc máy tính mới vào tháng sau.",
                            "来月、新しいパソコンを買いたいです。",
                            List.of("来月 (らいげつ)", "新しい (あたらしい)", "パソコン"),
                            List.of("～たいです"),
                            "N5",
                            "Nói về mong muốn của bản thân: [Động từ bỏ ます] + たいです."
                    )
            ),
            "N4", List.of(
                    new PracticeQuestionDto(
                            "Tôi đã từng xem bộ phim này cùng với bạn bè.",
                            "友達とこの映画を見たことがあります。",
                            List.of("友達 (ともだち)", "映画 (えいが)", "見る (みる)"),
                            List.of("～たことがある"),
                            "N4",
                            "Diễn tả kinh nghiệm trong quá khứ: [Động từ thể た] + ことがある."
                    ),
                    new PracticeQuestionDto(
                            "Kỳ nghỉ hè năm sau tôi dự định sẽ đi du lịch Nhật Bản.",
                            "来年の夏休みに日本へ旅行に行くつもりです。",
                            List.of("夏休み (なつやすみ)", "旅行 (りょこう)", "日本 (にほん)"),
                            List.of("～つもりです"),
                            "N4",
                            "Diễn tả dự định chắc chắn: [Động từ thể từ điển] + つもりです."
                    ),
                    new PracticeQuestionDto(
                            "Ngày mai tôi có cuộc hẹn quan trọng nên phải dậy sớm.",
                            "明日は大切な約束があるので、早く起きなければなりません。",
                            List.of("大切な (たいせつな)", "約束 (やくそく)", "起きる (おきる)"),
                            List.of("～ので", "～なければなりません"),
                            "N4",
                            "Bắt buộc phải làm gì: [Động từ thể ない bỏ い] + ければなりません."
                    ),
                    new PracticeQuestionDto(
                            "Nếu có thời gian rảnh, tôi muốn học nấu các món ăn Nhật.",
                            "暇な時間があったら、日本の料理の作り方を習いたいです。",
                            List.of("時間 (じかん)", "料理 (りょうり)", "習う (ならう)"),
                            List.of("～たら", "～方 (かた)"),
                            "N4",
                            "Câu điều kiện giả định: [Thể た] + ら và cách làm gì đó: [V-bỏ ます] + 方."
                    ),
                    new PracticeQuestionDto(
                            "Bác sĩ khuyên tôi nên ăn nhiều rau và tập thể dục mỗi ngày.",
                            "毎日もっと野菜を食べて、運動したほうがいいです。",
                            List.of("野菜 (やさい)", "食べる (たべる)", "運動する (うんどうする)"),
                            List.of("～たほうがいいです"),
                            "N4",
                            "Lời khuyên nên làm gì: [Động từ thể た] + ほうがいいです."
                    )
            ),
            "N3", List.of(
                    new PracticeQuestionDto(
                            "Nhờ có sự giúp đỡ của giáo viên mà tôi đã đỗ kỳ thi năng lực tiếng Nhật.",
                            "先生のおかげで、日本語能力試験に合格することができました。",
                            List.of("先生 (せんせい)", "試験 (しけん)", "合格する (ごうかくする)"),
                            List.of("～おかげで", "～ことができる"),
                            "N3",
                            "Nhờ vào (kết quả tích cực): [Danh từ + の] + おかげで."
                    ),
                    new PracticeQuestionDto(
                            "Dù công việc bận rộn đến mấy, tôi vẫn cố gắng học tiếng Nhật mỗi ngày.",
                            "どんなに仕事が忙しくても、毎日日本語を勉強するようにしています。",
                            List.of("仕事 (しごと)", "忙しい (いそがしい)", "勉強する (べんきょうする)"),
                            List.of("どんなに～ても", "～ようにしている"),
                            "N3",
                            "Duy trì thói quen/cố gắng đều đặn: [Động từ thể từ điển] + ようにしている."
                    ),
                    new PracticeQuestionDto(
                            "So với năm ngoái, tiếng Nhật của bạn đã trở nên trôi chảy hơn nhiều.",
                            "去年に比べて、日本語がずっと上手になりましたね。",
                            List.of("去年 (きょねん)", "上手 (じょうず)", "日本語 (にほんご)"),
                            List.of("～に比べて", "～ようになる / ～くなる"),
                            "N3",
                            "So với: [Danh từ] + に比べて."
                    ),
                    new PracticeQuestionDto(
                            "Trong lúc đang nấu ăn thì có điện thoại gọi đến từ công ty.",
                            "料理を作っている最中に、会社から電話がかかってきました。",
                            List.of("料理 (りょうり)", "会社 (かいしゃ)", "電話 (でんわ)"),
                            List.of("～最中に (さいちゅうに)"),
                            "N3",
                            "Đúng lúc đang làm gì thì có sự việc bất ngờ xen vào: [V-ている] + 最中に."
                    )
            ),
            "N2", List.of(
                    new PracticeQuestionDto(
                            "Không chỉ giỏi tiếng Anh mà anh ấy còn có thể nói thông thạo cả tiếng Nhật.",
                            "彼は英語が話せるだけでなく、日本語も流暢に話すことができる。",
                            List.of("英語 (えいご)", "流暢 (りゅうちょう)", "話す (はなす)"),
                            List.of("～だけでなく～も"),
                            "N2",
                            "Không những... mà còn...: [Thể thông thường] + だけでなく、[Danh từ] + も."
                    ),
                    new PracticeQuestionDto(
                            "Một khi đã hứa với khách hàng thì tuyệt đối không được phép thất hứa.",
                            "一度お客様と約束したからには、絶対に守らなければならない。",
                            List.of("お客様 (おきゃくさま)", "約束 (やくそく)", "守る (まもる)"),
                            List.of("～からには"),
                            "N2",
                            "Một khi đã...: [Động từ thể thông thường] + からには."
                    ),
                    new PracticeQuestionDto(
                            "Cùng với sự phát triển của công nghệ AI, cách làm việc của con người đang thay đổi lớn.",
                            "AI技術の発展に伴って、人々の働き方が大きく変わりつつある。",
                            List.of("発展 (はってん)", "働き方 (はたらきかた)", "変わる (かわる)"),
                            List.of("～に伴って", "～つつある"),
                            "N2",
                            "Cùng với sự biến đổi: [Danh từ] + に伴って và đang dần chuyển biến: [V-bỏ ます] + つつある."
                    )
            ),
            "N1", List.of(
                    new PracticeQuestionDto(
                            "Dù biết rõ sẽ gặp nhiều khó khăn nhưng anh ấy vẫn quyết tâm khởi nghiệp.",
                            "多くの困難があることを知りつつも、彼は起業する決意を固めた。",
                            List.of("困難 (こんなん)", "起業 (きぎょう)", "決意 (けつい)"),
                            List.of("～つつも"),
                            "N1",
                            "Mặc dù biết/làm A nhưng vẫn B: [Động từ bỏ ます] + つつ(も)."
                    ),
                    new PracticeQuestionDto(
                            "Thành công của dự án này không thể có được nếu thiếu sự hợp tác của toàn bộ các thành viên.",
                            "このプロジェクトの成功は、メンバー全員の協力なしにはあり得なかった。",
                            List.of("成功 (せいこう)", "協力 (きょうりょく)", "あり得る (ありえる)"),
                            List.of("～なしには～ない"),
                            "N1",
                            "Nếu không có A thì không thể B: [Danh từ] + なしには + [Phủ định]."
                    )
            )
    );

    @Override
    public String getProviderName() {
        return "local-mock";
    }

    @Override
    public PracticeQuestionDto generateExercise(List<String> targetVocab, List<String> targetGrammar, String level) {
        String normalizedLevel = (level != null && EXERCISE_BANK.containsKey(level.toUpperCase()))
                ? level.toUpperCase()
                : "N4";

        List<PracticeQuestionDto> bank = EXERCISE_BANK.get(normalizedLevel);
        int idx = levelCounters.computeIfAbsent(normalizedLevel, k -> new AtomicInteger(0))
                .getAndIncrement();

        return bank.get(Math.floorMod(idx, bank.size()));
    }

    @Override
    public EvaluationResultDto evaluateAnswer(String sentenceVi, String exampleJa, String userAnswer, String level) {
        String expected = exampleJa != null ? exampleJa.trim() : "友達とこの映画を見たことがあります。";
        String actual = userAnswer != null ? userAnswer.trim() : "";

        String normExpected = normalizeJapanese(expected);
        String normActual = normalizeJapanese(actual);

        List<String> grammarErrors = new ArrayList<>();
        List<String> vocabularyErrors = new ArrayList<>();

        // Exact or near-exact match after normalizing punctuation/spaces
        if (!normActual.isEmpty() && normActual.equals(normExpected)) {
            return new EvaluationResultDto(
                    true,
                    100,
                    100,
                    100,
                    98,
                    List.of(),
                    List.of(),
                    expected,
                    "Xuất sắc! Câu dịch tiếng Nhật của bạn hoàn toàn chính xác cả về ý nghĩa, ngữ pháp lẫn cách diễn đạt tự nhiên của người bản xứ."
            );
        }

        // Calculate character overlap & structural similarity
        double charSimilarity = computeBigramSimilarity(normExpected, normActual);

        // Find matching exercise in bank to inspect specific target vocabulary & grammar
        PracticeQuestionDto matchedQuestion = findMatchingQuestion(sentenceVi, expected);

        int vocabMatched = 0;
        int vocabTotal = 0;
        if (matchedQuestion != null && matchedQuestion.targetVocabulary() != null) {
            vocabTotal = matchedQuestion.targetVocabulary().size();
            for (String vocabTag : matchedQuestion.targetVocabulary()) {
                String headword = extractHeadword(vocabTag);
                String reading = extractReading(vocabTag);
                String stem = headword.length() > 1 ? headword.substring(0, headword.length() - 1) : headword;
                if (actual.contains(headword) || actual.contains(stem) || (!reading.isEmpty() && actual.contains(reading))) {
                    vocabMatched++;
                } else {
                    vocabularyErrors.add("Chưa sử dụng hoặc viết sai từ vựng mục tiêu: 「" + vocabTag + "」");
                }
            }
        }

        int grammarMatched = 0;
        int grammarTotal = 0;
        if (matchedQuestion != null && matchedQuestion.targetGrammar() != null) {
            grammarTotal = matchedQuestion.targetGrammar().size();
            for (String grammarTag : matchedQuestion.targetGrammar()) {
                String coreGrammar = extractCoreGrammar(grammarTag);
                if (!coreGrammar.isEmpty() && actual.contains(coreGrammar)) {
                    grammarMatched++;
                } else {
                    grammarErrors.add("Cần áp dụng đúng mẫu ngữ pháp mục tiêu: 「" + grammarTag + "」");
                }
            }
        }

        // Check particle warnings
        checkCommonParticleMistakes(expected, actual, grammarErrors);

        double vocabRatio = vocabTotal > 0 ? (double) vocabMatched / vocabTotal : charSimilarity;
        double grammarRatio = grammarTotal > 0 ? (double) grammarMatched / grammarTotal : charSimilarity;

        int meaningScore = (int) Math.round(Math.min(100, Math.max(25, (vocabRatio * 65) + (charSimilarity * 35))));
        int grammarScore = (int) Math.round(Math.min(100, Math.max(20, (grammarRatio * 65) + (charSimilarity * 35))));
        int naturalnessScore = (int) Math.round(Math.min(100, Math.max(25, (charSimilarity * 75) + (grammarRatio * 25))));

        // Boost scores if character similarity is very high (e.g. valid synonym or polite/plain variation)
        if (charSimilarity >= 0.72) {
            meaningScore = Math.max(meaningScore, 88);
            grammarScore = Math.max(grammarScore, 85);
            naturalnessScore = Math.max(naturalnessScore, 84);
        }

        int overallScore = (int) Math.round(meaningScore * 0.4 + grammarScore * 0.4 + naturalnessScore * 0.2);
        boolean isPass = overallScore >= 70;

        String explanation;
        if (overallScore >= 90) {
            explanation = "Câu dịch của bạn rất chuẩn xác và tự nhiên! Bạn đã vận dụng tốt cả từ vựng lẫn cấu trúc ngữ pháp mục tiêu của câu.";
        } else if (isPass) {
            explanation = "Câu của bạn diễn đạt đúng ý chính và cấu trúc trọng tâm! "
                    + (grammarErrors.isEmpty() && vocabularyErrors.isEmpty()
                    ? "Bạn có thể tham khảo thêm câu gợi ý bên trên để cách diễn đạt mượt mà như người bản xứ hơn."
                    : "Hãy lưu ý các điểm góp ý nhỏ bên dưới để câu văn hoàn hảo 100%.");
        } else {
            StringBuilder sb = new StringBuilder("Câu trả lời của bạn chưa khớp với cấu trúc hoặc từ vựng yêu cầu. ");
            if (matchedQuestion != null && matchedQuestion.hintVi() != null) {
                sb.append(matchedQuestion.hintVi()).append(" ");
            }
            sb.append("Hãy đối chiếu với đáp án chuẩn 「").append(expected).append("」 và thử lại nhé!");
            explanation = sb.toString();
        }

        return new EvaluationResultDto(
                isPass,
                overallScore,
                meaningScore,
                grammarScore,
                naturalnessScore,
                grammarErrors,
                vocabularyErrors,
                expected,
                explanation
        );
    }

    @Override
    public KaiwaResponseDto chatKaiwa(String userMessage, String level) {
        return new KaiwaResponseDto(
                "京都へ行ったことがありますか。とてもきれいな街ですよ。",
                "Câu trả lời của bạn rất tốt! AI gợi ý câu đàm thoại nối tiếp sử dụng cấu trúc kinh nghiệm 「～へ行ったことがありますか」."
        );
    }

    @Override
    public KanjiLookupDto lookupKanji(String word) {
        if ("掃除".equals(word)) {
            return new KanjiLookupDto(
                    "掃除",
                    "そうじ",
                    "TẢO TRỪ",
                    "dọn dẹp, quét dọn vệ sinh",
                    "N4",
                    List.of(
                            new KanjiLookupDto.KanjiDetailDto("掃", "TẢO", "quét, quét dọn"),
                            new KanjiLookupDto.KanjiDetailDto("除", "TRỪ", "trừ khử, loại bỏ")
                    )
            );
        }
        return new KanjiLookupDto(
                word,
                word,
                "---",
                "Từ vựng tiếng Nhật: " + word,
                "N4",
                List.of()
        );
    }

    private PracticeQuestionDto findMatchingQuestion(String sentenceVi, String exampleJa) {
        for (List<PracticeQuestionDto> list : EXERCISE_BANK.values()) {
            for (PracticeQuestionDto q : list) {
                if ((sentenceVi != null && q.sentenceVi().equalsIgnoreCase(sentenceVi.trim()))
                        || (exampleJa != null && q.exampleAnswerJa().equals(exampleJa.trim()))) {
                    return q;
                }
            }
        }
        return null;
    }

    private String normalizeJapanese(String input) {
        if (input == null) return "";
        return input.replaceAll("[\\s。、！？!?,\\.「」『』（）()]", "");
    }

    private String extractHeadword(String tag) {
        int idx = tag.indexOf('(');
        String raw = idx > 0 ? tag.substring(0, idx).trim() : tag.trim();
        if (raw.endsWith("する")) {
            return raw.substring(0, raw.length() - 2);
        }
        return raw;
    }

    private String extractReading(String tag) {
        int start = tag.indexOf('(');
        int end = tag.indexOf(')');
        if (start >= 0 && end > start) {
            return tag.substring(start + 1, end).trim();
        }
        return "";
    }

    private String extractCoreGrammar(String grammarTag) {
        String cleaned = grammarTag.replace("～", "")
                .replaceAll("\\(.*?\\)", "")
                .trim();
        if (cleaned.contains("/")) {
            cleaned = cleaned.split("/")[0].trim();
        }
        if (cleaned.contains("たことがある")) return "たことがあ";
        if (cleaned.contains("つもり")) return "つもり";
        if (cleaned.contains("なければなりません")) return "なければなり";
        if (cleaned.contains("ほうがいい")) return "ほうがいい";
        if (cleaned.contains("てから")) return "てから";
        if (cleaned.contains("ませんか")) return "ませんか";
        if (cleaned.contains("たいです")) return "たい";
        if (cleaned.contains("おかげで")) return "おかげで";
        if (cleaned.contains("ようにして")) return "ようにして";
        if (cleaned.contains("に比べて")) return "に比べて";
        if (cleaned.contains("最中に")) return "最中に";
        if (cleaned.contains("だけでなく")) return "だけでなく";
        if (cleaned.contains("からには")) return "からには";
        if (cleaned.contains("に伴って")) return "に伴って";
        if (cleaned.contains("つつ")) return "つつ";
        if (cleaned.contains("なしには")) return "なしには";
        return cleaned.length() > 3 ? cleaned.substring(0, 3) : cleaned;
    }

    private void checkCommonParticleMistakes(String expected, String actual, List<String> grammarErrors) {
        if (expected.contains("を") && !actual.contains("を") && actual.length() > 4) {
            grammarErrors.add("Thiếu trợ từ 「を」 chỉ tân ngữ trực tiếp của hành động.");
        }
        if (expected.contains("と") && !actual.contains("と") && expected.contains("友達と")) {
            grammarErrors.add("Lưu ý dùng trợ từ 「と」 (cùng với ai đó, ví dụ: 友達と).");
        }
    }

    private double computeBigramSimilarity(String s1, String s2) {
        if (s1.isEmpty() || s2.isEmpty()) return 0.0;
        if (s1.equals(s2)) return 1.0;
        if (s1.length() < 2 || s2.length() < 2) {
            return s1.contains(s2) || s2.contains(s1) ? 0.5 : 0.0;
        }
        List<String> bigrams1 = new ArrayList<>();
        for (int i = 0; i < s1.length() - 1; i++) {
            bigrams1.add(s1.substring(i, i + 2));
        }
        List<String> bigrams2 = new ArrayList<>();
        for (int i = 0; i < s2.length() - 1; i++) {
            bigrams2.add(s2.substring(i, i + 2));
        }
        int matches = 0;
        List<String> copy2 = new ArrayList<>(bigrams2);
        for (String bg : bigrams1) {
            if (copy2.remove(bg)) {
                matches++;
            }
        }
        return (2.0 * matches) / (bigrams1.size() + bigrams2.size());
    }
}
