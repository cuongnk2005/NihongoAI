package com.nihongoai.backend.pvp;

import com.nihongoai.backend.repository.VocabularyRepository;
import com.nihongoai.backend.entity.VocabularyEntity;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.Clock;
import java.util.*;

@Service
public class PvpService {
    private final VocabularyRepository vocabulary;
    private final Clock clock;
    private final Map<String, Room> rooms = new HashMap<>();
    private static final long REVEAL_MS = 3000, TTL_MS = 3600000;
    @org.springframework.beans.factory.annotation.Autowired
    public PvpService(VocabularyRepository vocabulary) { this(vocabulary, Clock.systemUTC()); }
    PvpService(VocabularyRepository vocabulary, Clock clock) { this.vocabulary = vocabulary; this.clock = clock; }

    public record PlayerView(int id, String name, String avatar, int score, boolean answered, Integer choice, int earned, Long elapsedMs) {}
    public record QuestionView(String type, String word, List<String> options, Integer correct, String section) {}
    public record View(String code, String phase, int round, int total, long serverTime, long deadline,
                       long nextAt, int you, String mode, int seconds, String sourceName, List<PlayerView> players, QuestionView question) {}
    public record Session(String token, View room) {}
    public record DeckWord(String word, String reading, String meaningVi) {}
    public record DeckSource(String name, List<DeckWord> cards) {}
    public record ExamQuestion(int number, String section, String question, List<String> options, Integer correct) {}
    public record ExamSource(String name, List<ExamQuestion> questions, boolean shuffle) {}
    private static class Player {
        String name, avatar, token = UUID.randomUUID().toString(); int score, earned; Integer choice; Long elapsedMs;
        Player(String name, String avatar) { this.name = name; this.avatar = avatar; }
    }
    private static class Room {
        String code, phase = "WAITING"; List<PvpQuestionGenerator.Question> questions; List<Player> players = new ArrayList<>();
        int index; long deadline, nextAt, touched;
        String mode = "DUEL"; int seconds = 15;
        String sourceName = "Kho từ backend";
    }
    private static final Set<String> AVATARS = Set.of("fox", "cat", "panda", "rabbit", "frog", "tiger", "bear", "penguin", "owl", "dragon", "dog", "koala");
    private String avatar(String avatar) {
        if (avatar == null) return "fox";
        if (!AVATARS.contains(avatar)) throw error("Icon đại diện không hợp lệ.");
        return avatar;
    }
    private ResponseStatusException error(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
    private String name(String name) {
        if (name == null || name.isBlank() || name.trim().length() > 24) throw error("Tên người chơi phải có 1–24 ký tự.");
        return name.trim();
    }
    public synchronized Session create(String name, int count) {
        return create(name, count, "DUEL", "fox", 15);
    }
    public synchronized Session create(String name, int count, String mode, String icon, int seconds) {
        return create(name, count, mode, icon, seconds, null);
    }
    public synchronized Session create(String name, int count, String mode, String icon, int seconds, DeckSource source) {
        return create(name, count, mode, icon, seconds, source, null);
    }
    public synchronized Session create(String name, int count, String mode, String icon, int seconds, DeckSource source, ExamSource exam) {
        String cleanName = name(name);
        String selectedAvatar = avatar(icon);
        if (mode == null) mode = "DUEL";
        if (!Set.of("DUEL", "QUIZ").contains(mode)) throw error("Chế độ phòng không hợp lệ.");
        if (!Set.of(15, 20, 30, 60).contains(seconds)) throw error("Thời gian phải là 15, 20, 30 hoặc 60 giây.");
        if (count < (exam == null ? 5 : 1) || count > (exam == null ? 20 : 500)) throw error("Số câu không hợp lệ: bộ thẻ 5–20 câu, bộ đề 1–500 câu.");
        if (source != null && exam != null) throw error("Chỉ được chọn một nguồn câu hỏi.");
        rooms.values().removeIf(r -> clock.millis() - r.touched > TTL_MS);
        if (rooms.size() >= 100) throw error("Máy chủ đã đầy phòng, vui lòng thử lại sau.");
        Room r = new Room();
        r.mode = mode; r.seconds = seconds;
        if (exam != null) {
            r.sourceName = exam.name() == null ? "" : exam.name().trim();
            if (r.sourceName.isEmpty() || r.sourceName.length() > 200 || exam.questions() == null
                || exam.questions().isEmpty() || exam.questions().size() > 500) throw error("Bộ đề phải có tên và 1–500 câu hỏi.");
            Set<Integer> numbers = new HashSet<>();
            r.questions = new ArrayList<>();
            for (ExamQuestion q : exam.questions()) {
                if (q == null || q.number() < 1 || !numbers.add(q.number()) || q.question() == null
                    || q.question().isBlank() || q.question().length() > 4000 || q.section() != null && q.section().length() > 200
                    || q.options() == null || q.options().size() != 4 || q.options().stream().anyMatch(o -> o == null || o.isBlank() || o.length() > 2000)
                    || q.correct() == null || q.correct() < 0 || q.correct() > 3) throw error("Bộ đề có câu thiếu nội dung, đáp án A–D, số câu trùng hoặc dữ liệu quá dài.");
                List<String> options = q.options().stream().map(String::trim).toList();
                if (options.stream().map(o -> java.text.Normalizer.normalize(o, java.text.Normalizer.Form.NFC)).distinct().count() != 4)
                    throw error("Các lựa chọn trong một câu không được trùng nhau.");
                r.questions.add(new PvpQuestionGenerator.Question(PvpQuestionGenerator.Type.IMPORTED, q.question().trim(),
                    options, q.correct(), q.section() == null ? "" : q.section().trim()));
            }
            if (exam.shuffle()) Collections.shuffle(r.questions);
            r.questions = new ArrayList<>(r.questions.subList(0, Math.min(count, r.questions.size())));
        } else {
        List<VocabularyEntity> bank;
        if (source == null) bank = vocabulary.findAll();
        else {
            if (source.name() == null || source.name().isBlank() || source.name().length() > 200
                || source.cards() == null || source.cards().isEmpty() || source.cards().size() > 5000)
                throw error("Bộ thẻ không hợp lệ. Chọn bộ có 5–5.000 thẻ từ vựng.");
            r.sourceName = source.name().trim();
            bank = new ArrayList<>();
            for (DeckWord card : source.cards()) {
                if (card == null || card.word() == null || card.word().isBlank() || card.word().length() > 300
                    || card.meaningVi() == null || card.meaningVi().isBlank() || card.meaningVi().length() > 2000
                    || card.reading() != null && card.reading().length() > 300)
                    throw error("Bộ thẻ có từ, nghĩa hoặc cách đọc không hợp lệ.");
                VocabularyEntity entry = new VocabularyEntity();
                entry.setWord(card.word()); entry.setReading(card.reading()); entry.setMeaningVi(card.meaningVi());
                bank.add(entry);
            }
        }
        r.questions = PvpQuestionGenerator.generate(bank, count, new Random());
        if (r.questions.size() < 5) throw error("Kho chủ phòng cần ít nhất 5 từ đủ điều kiện và 4 đáp án khác nhau cho mỗi dạng câu hỏi.");
        }
        do { r.code = UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT); } while (rooms.containsKey(r.code));
        r.players.add(new Player(cleanName, selectedAvatar)); r.touched = clock.millis(); rooms.put(r.code, r);
        return new Session(r.players.get(0).token, view(r, 0));
    }
    public synchronized Session join(String code, String name) {
        return join(code, name, "fox");
    }
    public synchronized Session join(String code, String name, String icon) {
        String selectedAvatar = avatar(icon);
        String cleanName = name(name); Room r = room(code);
        if (!r.phase.equals("WAITING") || r.players.size() >= (r.mode.equals("QUIZ") ? 51 : 2)) throw error("Phòng đã đủ người hoặc đã bắt đầu.");
        r.players.add(new Player(cleanName, selectedAvatar));
        int you = r.players.size() - 1;
        return new Session(r.players.get(you).token, view(r, you));
    }
    public synchronized View state(String code, String token) {
        Room r = room(code); int you = player(r, token); advance(r); return view(r, you);
    }
    public synchronized View start(String code, String token) {
        Room r = room(code);
        if (player(r, token) != 0) throw error("Chỉ chủ phòng được bắt đầu.");
        if (!r.phase.equals("WAITING") || r.players.size() < 2) throw error("Cần có người chơi để bắt đầu.");
        r.phase = "PLAYING"; r.deadline = clock.millis() + r.seconds * 1000L;
        return view(r, 0);
    }
    /** Host advances quiz through answer reveal, leaderboard, then the next question. */
    public synchronized View next(String code, String token, int round, String phase) {
        Room r = room(code);
        if (player(r, token) != 0 || !r.mode.equals("QUIZ")) throw error("Chỉ host phòng quiz được chuyển lượt.");
        advance(r);
        if (round != r.index + 1 || !r.phase.equals(phase)) throw error("Lượt đã thay đổi. Vui lòng thử lại.");
        switch (r.phase) {
            case "PLAYING" -> reveal(r);
            case "REVEAL" -> r.phase = "RANKING";
            case "RANKING" -> nextQuestion(r);
            default -> throw error("Không thể chuyển lượt lúc này.");
        }
        return view(r, 0);
    }
    public synchronized View answer(String code, String token, int round, int choice) {
        Room r = room(code); int you = player(r, token); advance(r);
        if (!r.phase.equals("PLAYING") || round != r.index + 1) throw error("Câu hỏi đã kết thúc.");
        Player p = r.players.get(you);
        if (p.choice != null) throw error("Bạn đã trả lời câu này.");
        if (choice < 0 || choice > 3) throw error("Lựa chọn không hợp lệ.");
        p.choice = choice;
        p.elapsedMs = Math.max(0, r.seconds * 1000L - (r.deadline - clock.millis()));
        p.earned = choice == r.questions.get(r.index).correct() ? 500 + (int)(500 * Math.max(0, r.deadline - clock.millis()) / (r.seconds * 1000L)) : 0;
        p.score += p.earned;
        if (r.players.stream().allMatch(x -> x.choice != null)) reveal(r);
        return view(r, you);
    }
    private Room room(String code) {
        Room r = code == null ? null : rooms.get(code.toUpperCase(Locale.ROOT));
        if (r == null || clock.millis() - r.touched > TTL_MS) throw error("Không tìm thấy phòng hoặc phòng đã hết hạn.");
        r.touched = clock.millis(); return r;
    }
    private int player(Room r, String token) {
        for (int i = 0; i < r.players.size(); i++) if (r.players.get(i).token.equals(token)) return i;
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên chơi không hợp lệ.");
    }
    private void reveal(Room r) { r.phase = "REVEAL"; r.nextAt = clock.millis() + REVEAL_MS; }
    private void nextQuestion(Room r) {
        if (r.index + 1 == r.questions.size()) r.phase = "FINISHED";
        else { r.index++; r.phase = "PLAYING"; r.deadline = clock.millis() + r.seconds * 1000L;
            r.players.forEach(p -> { p.choice = null; p.earned = 0; p.elapsedMs = null; }); }
    }
    private void advance(Room r) {
        if (r.phase.equals("PLAYING") && clock.millis() >= r.deadline) reveal(r);
        if (r.phase.equals("REVEAL") && clock.millis() >= r.nextAt) nextQuestion(r);
    }
    private View view(Room r, int you) {
        boolean reveal = Set.of("REVEAL", "RANKING", "FINISHED").contains(r.phase);
        PvpQuestionGenerator.Question q = r.questions.get(r.index);
        return new View(r.code, r.phase, r.index + 1, r.questions.size(), clock.millis(), r.deadline, r.nextAt, you, r.mode, r.seconds, r.sourceName,
            java.util.stream.IntStream.range(0, r.players.size()).mapToObj(i -> {
                Player p = r.players.get(i);
                return new PlayerView(i, p.name, p.avatar, reveal ? p.score : p.score - p.earned,
                    p.choice != null, reveal || i == you ? p.choice : null, reveal ? p.earned : 0, reveal || i == you ? p.elapsedMs : null);
            }).toList(),
            r.phase.equals("WAITING") ? null : new QuestionView(q.type().name(), q.word(), q.options(), reveal ? q.correct() : null, q.section()));
    }
}
