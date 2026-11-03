package com.nihongoai.backend.repository;

import com.nihongoai.backend.entity.GrammarEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GrammarRepository extends JpaRepository<GrammarEntity, Long> {

    List<GrammarEntity> findByJlptLevel(String jlptLevel);

    @Query("SELECT g FROM GrammarEntity g WHERE " +
           "LOWER(g.pattern) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(g.meaningVi) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(g.structure IS NOT NULL AND LOWER(g.structure) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<GrammarEntity> searchGrammars(String query);
}
