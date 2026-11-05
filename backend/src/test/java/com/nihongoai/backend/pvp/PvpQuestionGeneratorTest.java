package com.nihongoai.backend.pvp;

import com.nihongoai.backend.entity.VocabularyEntity;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class PvpQuestionGeneratorTest {
    private VocabularyEntity word(String japanese, String meaning, String reading) {
        var v = new VocabularyEntity(); v.setWord(japanese); v.setMeaningVi(meaning); v.setReading(reading); return v;
    }
    private List<VocabularyEntity> bank() {
        return List.of(word("学校", "Trường học", "がっこう"), word("先生", "Giáo viên", "せんせい"),
            word("学生", "Học sinh", "がくせい"), word("日本", "Nhật Bản", "にほん"),
            word("本", "Sách", "ほん"), word("水", "Nước", "みず"), word("ねこ", "Mèo", "ねこ"));
    }
    @Test void mixesAllThreeTypesWithCorrectAnswersAndDistinctOptions() {
        var questions = PvpQuestionGenerator.generate(bank(), 7, new Random(42));
        assertEquals(7, questions.size());
        assertEquals(3, questions.stream().map(PvpQuestionGenerator.Question::type).distinct().count());
        Set<String> used = new HashSet<>();
        for (var q : questions) {
            assertEquals(4, new HashSet<>(q.options()).size());
            String correct = q.options().get(q.correct());
            var source = bank().stream().filter(v -> switch (q.type()) {
                case JAPANESE_TO_VIETNAMESE -> v.getWord().equals(q.word()) && v.getMeaningVi().equals(correct);
                case VIETNAMESE_TO_JAPANESE -> v.getMeaningVi().equals(q.word()) && v.getWord().equals(correct);
                case KANJI_TO_HIRAGANA -> v.getWord().equals(q.word()) && v.getReading().equals(correct);
            }).findFirst().orElseThrow();
            assertTrue(used.add(source.getWord()), "A source word must not repeat across types");
            if (q.type() == PvpQuestionGenerator.Type.KANJI_TO_HIRAGANA) {
                assertNotEquals("ねこ", q.word());
                assertTrue(q.options().stream().allMatch(o -> o.matches("[\\p{IsHiragana}ー]+")));
            }
        }
    }
    @Test void skipsReadingTypeWhenThereAreNotFourValidDistinctReadings() {
        var words = new ArrayList<>(bank());
        words.forEach(v -> v.setReading("カタカナ"));
        words.get(0).setReading(null); words.get(1).setReading(" "); words.get(2).setReading("がっこう");
        var questions = PvpQuestionGenerator.generate(words, 7, new Random(7));
        assertEquals(7, questions.size());
        assertTrue(questions.stream().noneMatch(q -> q.type() == PvpQuestionGenerator.Type.KANJI_TO_HIRAGANA));
    }
    @Test void ambiguousVietnamesePromptsAreExcluded() {
        var words = new ArrayList<>(bank());
        words.add(word("教師", "Giáo viên", "きょうし"));
        var questions = PvpQuestionGenerator.generate(words, 20, new Random(1));
        assertTrue(questions.stream().noneMatch(q -> q.type() == PvpQuestionGenerator.Type.VIETNAMESE_TO_JAPANESE
            && q.word().equals("Giáo viên")));
    }
    @Test void readingOptionsAreDeduplicated() {
        var words = new ArrayList<>(bank());
        words.add(word("見る", "Nhìn", "みる")); words.add(word("観る", "Xem", "みる"));
        for (int seed = 0; seed < 10; seed++) {
            var questions = PvpQuestionGenerator.generate(words, 20, new Random(seed));
            assertTrue(questions.stream().allMatch(q -> new HashSet<>(q.options()).size() == 4));
        }
    }
}
