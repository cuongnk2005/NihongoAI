package com.nihongoai.backend.repository;

import com.nihongoai.backend.entity.GrammarReviewStateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GrammarReviewStateRepository extends JpaRepository<GrammarReviewStateEntity, Long> {

    Optional<GrammarReviewStateEntity> findByGrammarId(Long grammarId);

    @Query("SELECT r FROM GrammarReviewStateEntity r WHERE r.due <= :now ORDER BY r.due ASC")
    List<GrammarReviewStateEntity> findDueGrammars(LocalDateTime now);

    @Query("SELECT COUNT(r) FROM GrammarReviewStateEntity r WHERE r.due <= :now")
    long countDueGrammars(LocalDateTime now);
}

