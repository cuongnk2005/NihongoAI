package com.nihongoai.backend.repository;

import com.nihongoai.backend.entity.GrammarReviewLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarReviewLogRepository extends JpaRepository<GrammarReviewLogEntity, Long> {
    List<GrammarReviewLogEntity> findByGrammarIdOrderByReviewTimeDesc(Long grammarId);
}

