package com.nihongoai.backend.repository;

import com.nihongoai.backend.entity.VocabularyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VocabularyRepository extends JpaRepository<VocabularyEntity, Long> {

    List<VocabularyEntity> findByJlptLevel(String jlptLevel);

    @Query("SELECT v FROM VocabularyEntity v WHERE " +
           "LOWER(v.word) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.reading) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.meaningVi) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<VocabularyEntity> searchVocabularies(String query);
}
