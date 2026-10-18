package com.nihongoai.backend.repository;

import com.nihongoai.backend.entity.ReviewLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewLogRepository extends JpaRepository<ReviewLogEntity, Long> {
    List<ReviewLogEntity> findByCardIdOrderByReviewTimeDesc(Long cardId);
    Optional<ReviewLogEntity> findFirstByCardIdOrderByReviewTimeDesc(Long cardId);
}
