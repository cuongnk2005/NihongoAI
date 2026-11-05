package com.nihongoai.backend.pvp;

import com.nihongoai.backend.entity.VocabularyEntity;
import java.text.Normalizer;
import java.util.*;

/** Creates questions from a snapshot of the host's vocabulary without changing stored text. */
final class PvpQuestionGenerator {
    enum Type { JAPANESE_TO_VIETNAMESE, VIETNAMESE_TO_JAPANESE, KANJI_TO_HIRAGANA }
    record Question(Type type, String word, List<String> options, int correct) {}
    private record Entry(String word, String meaning, String reading) {}
    private record Candidate(Type type, String source, String prompt, String answer) {}

    static List<Question> generate(List<VocabularyEntity> vocabulary, int count, Random random) {
        List<Entry> bank = vocabulary.stream()
            .map(v -> new Entry(clean(v.getWord()), clean(v.getMeaningVi()), clean(v.getReading())))
            .filter(v -> !v.word.isEmpty() && !v.meaning.isEmpty()).distinct().toList();
        Map<Type, List<Candidate>> pools = new EnumMap<>(Type.class);
        for (Type type : Type.values()) {
            List<Candidate> candidates = new ArrayList<>();
            for (Entry entry : bank) {
                switch (type) {
                    case JAPANESE_TO_VIETNAMESE -> candidates.add(new Candidate(type, entry.word, entry.word, entry.meaning));
                    case VIETNAMESE_TO_JAPANESE -> candidates.add(new Candidate(type, entry.word, entry.meaning, entry.word));
                    case KANJI_TO_HIRAGANA -> {
                        if (entry.word.codePoints().anyMatch(c -> Character.UnicodeScript.of(c) == Character.UnicodeScript.HAN)
                            && entry.reading.matches("[\\p{IsHiragana}ー]+"))
                            candidates.add(new Candidate(type, entry.word, entry.word, entry.reading));
                    }
                }
            }
            // Skip ambiguous prompts, e.g. one Vietnamese meaning mapped to multiple Japanese words.
            Map<String, Set<String>> answers = new HashMap<>();
            candidates.forEach(c -> answers.computeIfAbsent(c.prompt, ignored -> new HashSet<>()).add(c.answer));
            List<Candidate> valid = candidates.stream().filter(c -> answers.get(c.prompt).size() == 1).distinct().toList();
            if (valid.stream().map(Candidate::answer).distinct().count() >= 4) pools.put(type, valid);
        }
        Set<String> used = new HashSet<>();
        List<Question> questions = new ArrayList<>();
        List<Type> rotation = new ArrayList<>();
        while (questions.size() < count) {
            List<Type> available = pools.keySet().stream()
                .filter(t -> pools.get(t).stream().anyMatch(c -> !used.contains(c.source))).toList();
            if (available.isEmpty()) break;
            rotation.retainAll(available);
            if (rotation.isEmpty()) { rotation.addAll(available); Collections.shuffle(rotation, random); }
            Type type = rotation.remove(0);
            List<Candidate> choices = pools.get(type).stream().filter(c -> !used.contains(c.source)).toList();
            Candidate selected = choices.get(random.nextInt(choices.size()));
            List<String> options = new ArrayList<>(pools.get(type).stream().map(Candidate::answer)
                .filter(a -> !a.equals(selected.answer)).distinct().toList());
            Collections.shuffle(options, random);
            options = new ArrayList<>(options.subList(0, 3)); options.add(selected.answer); Collections.shuffle(options, random);
            questions.add(new Question(type, selected.prompt, List.copyOf(options), options.indexOf(selected.answer)));
            used.add(selected.source);
        }
        return questions;
    }
    private static String clean(String value) {
        return value == null ? "" : Normalizer.normalize(value.trim(), Normalizer.Form.NFC);
    }
}
