package com.nihongoai.backend.repository;

import com.nihongoai.backend.entity.DeckEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeckRepository extends JpaRepository<DeckEntity, Long> {
}
