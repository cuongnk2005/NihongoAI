package com.nihongoai.backend.pvp;

import com.nihongoai.backend.repository.VocabularyRepository;
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
    private static final long TURN_MS = 15000, REVEAL_MS = 3000, TTL_MS = 3600000;
    @org.springframework.beans.factory.annotation.Autowired
    public PvpService(VocabularyRepository vocabulary) { this(vocabulary, Clock.systemUTC()); }
    PvpService(VocabularyRepository vocabulary, Clock clock) { this.vocabulary = vocabulary; this.clock = clock; }

    public record PlayerView(String name, int score, boolean answered, Integer choice, int earned) {}
    public record QuestionView(String type, String word, List<String> options, Integer correct) {}
    public record View(String code, String phase, int round, int total, long serverTime, long deadline,
                       long nextAt, int you, List<PlayerView> players, QuestionView question) {}
    public record Session(String token, View room) {}
    private static class Player {
        String name, token = UUID.randomUUID().toString(); int score, earned; Integer choice;
        Player(String name) { this.name = name; }
    }
    private static class Room {
        String code, phase = "WAITING"; List<PvpQuestionGenerator.Question> questions; List<Player> players = new ArrayList<>();
        int index; long deadline, nextAt, touched;
    }
    private ResponseStatusException error(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
    private String name(String name) {
        if (name == null || name.isBlank() || name.trim().length() > 24) throw error("Tên người chơi phải có 1–24 ký tự.");
        return name.trim();
    }
    public synchronized Session create(String name, int count) {
        String cleanName = name(name);
        if (count < 5 || count > 20) throw error("Chọn từ 5 đến 20 câu.");
        rooms.values().removeIf(r -> clock.millis() - r.touched > TTL_MS);
        if (rooms.size() >= 100) throw error("Máy chủ đã đầy phòng, vui lòng thử lại sau.");
        Room r = new Room();
        r.questions = PvpQuestionGenerator.generate(vocabulary.findAll(), count, new Random());
        if (r.questions.size() < 5) throw error("Kho chủ phòng cần ít nhất 5 từ đủ điều kiện và 4 đáp án khác nhau cho mỗi dạng câu hỏi.");
        do { r.code = UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT); } while (rooms.containsKey(r.code));
        r.players.add(new Player(cleanName)); r.touched = clock.millis(); rooms.put(r.code, r);
        return new Session(r.players.get(0).token, view(r, 0));
    }
    public synchronized Session join(String code, String name) {
        String cleanName = name(name); Room r = room(code);
        if (!r.phase.equals("WAITING") || r.players.size() == 2) throw error("Phòng đã đủ người hoặc đã bắt đầu.");
        r.players.add(new Player(cleanName));
        return new Session(r.players.get(1).token, view(r, 1));
    }
    public synchronized View state(String code, String token) {
        Room r = room(code); int you = player(r, token); advance(r); return view(r, you);
    }
    public synchronized View start(String code, String token) {
        Room r = room(code);
        if (player(r, token) != 0) throw error("Chỉ chủ phòng được bắt đầu.");
        if (!r.phase.equals("WAITING") || r.players.size() != 2) throw error("Cần đủ hai người để bắt đầu.");
        r.phase = "PLAYING"; r.deadline = clock.millis() + TURN_MS;
        return view(r, 0);
    }
    public synchronized View answer(String code, String token, int round, int choice) {
        Room r = room(code); int you = player(r, token); advance(r);
        if (!r.phase.equals("PLAYING") || round != r.index + 1) throw error("Câu hỏi đã kết thúc.");
        Player p = r.players.get(you);
        if (p.choice != null) throw error("Bạn đã trả lời câu này.");
        if (choice < 0 || choice > 3) throw error("Lựa chọn không hợp lệ.");
        p.choice = choice;
        p.earned = choice == r.questions.get(r.index).correct() ? 500 + (int)(500 * Math.max(0, r.deadline - clock.millis()) / TURN_MS) : 0;
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
    private void advance(Room r) {
        if (r.phase.equals("PLAYING") && clock.millis() >= r.deadline) reveal(r);
        if (r.phase.equals("REVEAL") && clock.millis() >= r.nextAt) {
            if (r.index + 1 == r.questions.size()) r.phase = "FINISHED";
            else { r.index++; r.phase = "PLAYING"; r.deadline = clock.millis() + TURN_MS;
                r.players.forEach(p -> { p.choice = null; p.earned = 0; }); }
        }
    }
    private View view(Room r, int you) {
        boolean reveal = r.phase.equals("REVEAL") || r.phase.equals("FINISHED");
        PvpQuestionGenerator.Question q = r.questions.get(r.index);
        return new View(r.code, r.phase, r.index + 1, r.questions.size(), clock.millis(), r.deadline, r.nextAt, you,
            r.players.stream().map(p -> new PlayerView(p.name, reveal ? p.score : p.score - p.earned,
                p.choice != null, reveal ? p.choice : null, reveal ? p.earned : 0)).toList(),
            r.phase.equals("WAITING") ? null : new QuestionView(q.type().name(), q.word(), q.options(), reveal ? q.correct() : null));
    }
}
