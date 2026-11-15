package com.nihongoai.backend.repository;

import com.nihongoai.backend.entity.ReviewLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewLogRepository extends JpaRepository<ReviewLogEntity, Long> {
    List<ReviewLogEntity> findByCardIdOrderByReviewTimeDesc(Long cardId);
    Optional<ReviewLogEntity> findFirstByCardIdOrderByReviewTimeDesc(Long cardId);

    @Query("SELECT r FROM ReviewLogEntity r WHERE r.reviewTime >= :since ORDER BY r.reviewTime DESC")
    List<ReviewLogEntity> findAllSince(LocalDateTime since);
}
