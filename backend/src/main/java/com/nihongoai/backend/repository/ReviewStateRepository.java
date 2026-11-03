package com.nihongoai.backend.repository;

import com.nihongoai.backend.entity.ReviewStateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewStateRepository extends JpaRepository<ReviewStateEntity, Long> {

    Optional<ReviewStateEntity> findByCardId(Long cardId);

    @Query("SELECT r FROM ReviewStateEntity r WHERE r.due <= :now ORDER BY r.due ASC")
    List<ReviewStateEntity> findDueCards(LocalDateTime now);

    @Query("SELECT COUNT(r) FROM ReviewStateEntity r WHERE r.state = 'NEW'")
    long countNewCards();

    @Query("SELECT COUNT(r) FROM ReviewStateEntity r WHERE r.state = 'LEARNING' OR r.state = 'RELEARNING'")
    long countLearningCards();

    @Query("SELECT COUNT(r) FROM ReviewStateEntity r WHERE r.state = 'REVIEW' AND r.due <= :now")
    long countDueCards(LocalDateTime now);
}
