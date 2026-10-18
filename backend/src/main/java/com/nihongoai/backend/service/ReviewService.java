package com.nihongoai.backend.service;

import com.nihongoai.backend.entity.CardEntity;
import com.nihongoai.backend.entity.ReviewLogEntity;
import com.nihongoai.backend.entity.ReviewStateEntity;
import com.nihongoai.backend.repository.CardRepository;
import com.nihongoai.backend.repository.ReviewLogRepository;
import com.nihongoai.backend.repository.ReviewStateRepository;
import com.nihongoai.backend.srs.FSRSRating;
import com.nihongoai.backend.srs.FSRSResult;
import com.nihongoai.backend.srs.FSRSScheduler;
import com.nihongoai.backend.srs.FSRSState;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final CardRepository cardRepository;
    private final ReviewStateRepository reviewStateRepository;
    private final ReviewLogRepository reviewLogRepository;
    private final FSRSScheduler fsrsScheduler;

    public ReviewService(
            CardRepository cardRepository,
            ReviewStateRepository reviewStateRepository,
            ReviewLogRepository reviewLogRepository,
            FSRSScheduler fsrsScheduler
    ) {
        this.cardRepository = cardRepository;
        this.reviewStateRepository = reviewStateRepository;
        this.reviewLogRepository = reviewLogRepository;
        this.fsrsScheduler = fsrsScheduler;
    }

    public List<CardEntity> getDueCards() {
        List<ReviewStateEntity> dueStates = reviewStateRepository.findDueCards(LocalDateTime.now());
        List<Long> cardIds = dueStates.stream().map(ReviewStateEntity::getCardId).toList();
        return cardRepository.findAllById(cardIds);
    }

    @Transactional
    public FSRSResult processAnswer(Long cardId, String ratingStr) {
        FSRSRating rating = FSRSRating.fromString(ratingStr);
        LocalDateTime now = LocalDateTime.now();

        ReviewStateEntity stateEntity = reviewStateRepository.findByCardId(cardId)
                .orElseGet(() -> new ReviewStateEntity(cardId));

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

        // Append to ReviewLog (Audit trail)
        ReviewLogEntity log = new ReviewLogEntity(
                cardId,
                rating.name(),
                stabilityBefore,
                difficultyBefore,
                result.scheduledDays(),
                result.scheduledDays()
        );
        reviewLogRepository.save(log);

        return result;
    }

    @Transactional
    public boolean undoLastReview(Long cardId) {
        Optional<ReviewLogEntity> lastLog = reviewLogRepository.findFirstByCardIdOrderByReviewTimeDesc(cardId);
        if (lastLog.isEmpty()) return false;

        ReviewLogEntity log = lastLog.get();
        ReviewStateEntity state = reviewStateRepository.findByCardId(cardId).orElse(null);
        if (state == null) return false;

        state.setStability(log.getStabilityBefore());
        state.setDifficulty(log.getDifficultyBefore());
        state.setReps(Math.max(0, state.getReps() - 1));
        state.setDue(LocalDateTime.now());
        reviewStateRepository.save(state);

        reviewLogRepository.delete(log);
        return true;
    }
}
