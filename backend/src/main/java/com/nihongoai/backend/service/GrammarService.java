package com.nihongoai.backend.service;

import com.nihongoai.backend.dto.GrammarStudyItemDto;
import com.nihongoai.backend.entity.GrammarEntity;
import com.nihongoai.backend.entity.GrammarReviewLogEntity;
import com.nihongoai.backend.entity.GrammarReviewStateEntity;
import com.nihongoai.backend.repository.GrammarRepository;
import com.nihongoai.backend.repository.GrammarReviewLogRepository;
import com.nihongoai.backend.repository.GrammarReviewStateRepository;
import com.nihongoai.backend.srs.FSRSRating;
import com.nihongoai.backend.srs.FSRSResult;
import com.nihongoai.backend.srs.FSRSScheduler;
import com.nihongoai.backend.srs.FSRSState;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class GrammarService {

    private final GrammarRepository grammarRepository;
    private final GrammarReviewStateRepository reviewStateRepository;
    private final GrammarReviewLogRepository reviewLogRepository;
    private final FSRSScheduler fsrsScheduler;

    public GrammarService(
            GrammarRepository grammarRepository,
            GrammarReviewStateRepository reviewStateRepository,
            GrammarReviewLogRepository reviewLogRepository,
            FSRSScheduler fsrsScheduler
    ) {
        this.grammarRepository = grammarRepository;
        this.reviewStateRepository = reviewStateRepository;
        this.reviewLogRepository = reviewLogRepository;
        this.fsrsScheduler = fsrsScheduler;
    }

    public List<GrammarEntity> getAllGrammars(String level, String query) {
        if (query != null && !query.trim().isEmpty()) {
            return grammarRepository.searchGrammars(query.trim());
        }
        if (level != null && !level.equalsIgnoreCase("ALL")) {
            return grammarRepository.findByJlptLevel(level.toUpperCase());
        }
        return grammarRepository.findAll();
    }

    public Optional<GrammarEntity> getGrammarById(Long id) {
        return grammarRepository.findById(id);
    }

    public GrammarEntity createGrammar(GrammarEntity grammar) {
        return grammarRepository.save(grammar);
    }

    public boolean deleteGrammar(Long id) {
        if (grammarRepository.existsById(id)) {
            grammarRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Retrieves up to `limit` grammar items prioritized for a study session.
     * Priority: 1) Due reviews (due <= now) -> 2) Learning/Relearning -> 3) New items -> 4) Other items
     */
    public List<GrammarStudyItemDto> getStudySession(String level, int limit) {
        int maxItems = limit > 0 ? limit : 5;
        List<GrammarEntity> pool = (level != null && !level.equalsIgnoreCase("ALL"))
                ? grammarRepository.findByJlptLevel(level.toUpperCase())
                : grammarRepository.findAll();

        if (pool.isEmpty()) {
            return Collections.emptyList();
        }

        LocalDateTime now = LocalDateTime.now();
        List<GrammarEntity> dueList = new ArrayList<>();
        List<GrammarEntity> learningList = new ArrayList<>();
        List<GrammarEntity> newList = new ArrayList<>();
        List<GrammarEntity> remainingList = new ArrayList<>();

        Map<Long, GrammarReviewStateEntity> stateMap = new HashMap<>();

        for (GrammarEntity g : pool) {
            Optional<GrammarReviewStateEntity> stateOpt = reviewStateRepository.findByGrammarId(g.getId());
            if (stateOpt.isEmpty()) {
                newList.add(g);
            } else {
                GrammarReviewStateEntity state = stateOpt.get();
                stateMap.put(g.getId(), state);
                if ("NEW".equals(state.getState())) {
                    newList.add(g);
                } else if ("LEARNING".equals(state.getState()) || "RELEARNING".equals(state.getState())) {
                    learningList.add(g);
                } else if (state.getDue().isBefore(now) || state.getDue().isEqual(now)) {
                    dueList.add(g);
                } else {
                    remainingList.add(g);
                }
            }
        }

        // Shuffle within groups to give variety
        Collections.shuffle(dueList);
        Collections.shuffle(learningList);
        Collections.shuffle(newList);
        remainingList.sort(Comparator.comparing(g -> stateMap.get(g.getId()).getDue()));

        List<GrammarEntity> selected = new ArrayList<>();
        // Priority 1: Due
        for (GrammarEntity g : dueList) {
            if (selected.size() < maxItems) selected.add(g);
        }
        // Priority 2: Learning
        for (GrammarEntity g : learningList) {
            if (selected.size() < maxItems && !selected.contains(g)) selected.add(g);
        }
        // Priority 3: New
        for (GrammarEntity g : newList) {
            if (selected.size() < maxItems && !selected.contains(g)) selected.add(g);
        }
        // Priority 4: Remaining review cards if still not enough
        for (GrammarEntity g : remainingList) {
            if (selected.size() < maxItems && !selected.contains(g)) selected.add(g);
        }

        return selected.stream().map(g -> {
            GrammarReviewStateEntity s = stateMap.get(g.getId());
            return new GrammarStudyItemDto(
                    g.getId(),
                    g.getPattern(),
                    g.getMeaningVi(),
                    g.getStructure(),
                    g.getExplanation(),
                    g.getJlptLevel(),
                    s != null ? s.getState() : "NEW",
                    s != null ? s.getReps() : 0,
                    s != null ? s.getStability() : 0.0,
                    s != null ? s.getDifficulty() : 5.0,
                    s != null ? s.getDue() : now
            );
        }).toList();
    }

    /**
     * Submits an Anki/FSRS review for a specific grammar item.
     */
    @Transactional
    public FSRSResult processGrammarReview(Long grammarId, String ratingStr) {
        FSRSRating rating = FSRSRating.fromString(ratingStr);
        LocalDateTime now = LocalDateTime.now();

        GrammarReviewStateEntity stateEntity = reviewStateRepository.findByGrammarId(grammarId)
                .orElseGet(() -> new GrammarReviewStateEntity(grammarId));

        double stabilityBefore = stateEntity.getStability();
        double difficultyBefore = stateEntity.getDifficulty();
        FSRSState currentState = FSRSState.valueOf(stateEntity.getState());

        FSRSResult result = fsrsScheduler.computeNextState(
                stabilityBefore,
                difficultyBefore,
                stateEntity.getReps(),
                stateEntity.getLapses(),
                currentState,
                stateEntity.getLastReview(),
                rating,
                now
        );

        // Update ReviewState
        stateEntity.setStability(result.stability());
        stateEntity.setDifficulty(result.difficulty());
        stateEntity.setReps(result.reps());
        stateEntity.setLapses(result.lapses());
        stateEntity.setState(result.state().name());
        stateEntity.setDue(result.nextDue());
        stateEntity.setLastReview(now);
        reviewStateRepository.save(stateEntity);

        // Append to ReviewLog
        GrammarReviewLogEntity log = new GrammarReviewLogEntity(
                grammarId,
                rating.name(),
                stabilityBefore,
                difficultyBefore,
                result.scheduledDays(),
                result.scheduledDays()
        );
        reviewLogRepository.save(log);

        return result;
    }
}
