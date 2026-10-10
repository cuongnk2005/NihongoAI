package com.nihongoai.backend.repository;

import com.nihongoai.backend.entity.NoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<NoteEntity, Long> {
    List<NoteEntity> findByDeckId(Long deckId);
}
