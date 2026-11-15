package com.nihongoai.backend.repository;

import com.nihongoai.backend.entity.GrammarReviewLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GrammarReviewLogRepository extends JpaRepository<GrammarReviewLogEntity, Long> {
    List<GrammarReviewLogEntity> findByGrammarIdOrderByReviewTimeDesc(Long grammarId);

    @Query("SELECT g FROM GrammarReviewLogEntity g WHERE g.reviewTime >= :since ORDER BY g.reviewTime DESC")
    List<GrammarReviewLogEntity> findAllSince(LocalDateTime since);
}

