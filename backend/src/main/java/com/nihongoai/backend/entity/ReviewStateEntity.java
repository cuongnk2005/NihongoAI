package com.nihongoai.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_state")
public class ReviewStateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "card_id", nullable = false, unique = true)
    private Long cardId;

    @Column(nullable = false)
    private Double stability = 0.0;

    @Column(nullable = false)
    private Double difficulty = 5.0;

    @Column(nullable = false)
    private Integer reps = 0;

    @Column(nullable = false)
    private Integer lapses = 0;

    @Column(nullable = false)
    private String state = "NEW";

    @Column(nullable = false)
    private LocalDateTime due = LocalDateTime.now();

    @Column(name = "last_review")
    private LocalDateTime lastReview;

    public ReviewStateEntity() {}

    public ReviewStateEntity(Long cardId) {
        this.cardId = cardId;
        this.stability = 0.0;
        this.difficulty = 5.0;
        this.reps = 0;
        this.lapses = 0;
        this.state = "NEW";
        this.due = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCardId() { return cardId; }
    public void setCardId(Long cardId) { this.cardId = cardId; }

    public Double getStability() { return stability; }
    public void setStability(Double stability) { this.stability = stability; }

    public Double getDifficulty() { return difficulty; }
    public void setDifficulty(Double difficulty) { this.difficulty = difficulty; }

    public Integer getReps() { return reps; }
    public void setReps(Integer reps) { this.reps = reps; }

    public Integer getLapses() { return lapses; }
    public void setLapses(Integer lapses) { this.lapses = lapses; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public LocalDateTime getDue() { return due; }
    public void setDue(LocalDateTime due) { this.due = due; }

    public LocalDateTime getLastReview() { return lastReview; }
    public void setLastReview(LocalDateTime lastReview) { this.lastReview = lastReview; }
}
