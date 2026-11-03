package com.nihongoai.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "card")
public class CardEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "note_id", nullable = false)
    private Long noteId;

    @Column(name = "deck_id", nullable = false)
    private Long deckId;

    @Column(name = "card_type", nullable = false)
    private String cardType = "FORWARD";

    @Column(name = "front_content", nullable = false)
    private String frontContent;

    @Column(name = "back_content", nullable = false)
    private String backContent;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public CardEntity() {}

    public CardEntity(Long noteId, Long deckId, String cardType, String frontContent, String backContent) {
        this.noteId = noteId;
        this.deckId = deckId;
        this.cardType = cardType;
        this.frontContent = frontContent;
        this.backContent = backContent;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getNoteId() { return noteId; }
    public void setNoteId(Long noteId) { this.noteId = noteId; }

    public Long getDeckId() { return deckId; }
    public void setDeckId(Long deckId) { this.deckId = deckId; }

    public String getCardType() { return cardType; }
    public void setCardType(String cardType) { this.cardType = cardType; }

    public String getFrontContent() { return frontContent; }
    public void setFrontContent(String frontContent) { this.frontContent = frontContent; }

    public String getBackContent() { return backContent; }
    public void setBackContent(String backContent) { this.backContent = backContent; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
