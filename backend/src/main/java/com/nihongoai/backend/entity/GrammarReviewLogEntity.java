package com.nihongoai.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "grammar_review_log")
public class GrammarReviewLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "grammar_id", nullable = false)
    private Long grammarId;

    @Column(nullable = false)
    private String rating;

    @Column(name = "stability_before", nullable = false)
    private Double stabilityBefore = 0.0;

    @Column(name = "difficulty_before", nullable = false)
    private Double difficultyBefore = 5.0;

    @Column(name = "elapsed_days", nullable = false)
    private Integer elapsedDays = 0;

    @Column(name = "scheduled_days", nullable = false)
    private Integer scheduledDays = 0;

    @Column(name = "review_time")
    private LocalDateTime reviewTime = LocalDateTime.now();

    public GrammarReviewLogEntity() {}

    public GrammarReviewLogEntity(Long grammarId, String rating, Double stabilityBefore, Double difficultyBefore, Integer elapsedDays, Integer scheduledDays) {
        this.grammarId = grammarId;
        this.rating = rating;
        this.stabilityBefore = stabilityBefore;
        this.difficultyBefore = difficultyBefore;
        this.elapsedDays = elapsedDays;
        this.scheduledDays = scheduledDays;
        this.reviewTime = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGrammarId() { return grammarId; }
    public void setGrammarId(Long grammarId) { this.grammarId = grammarId; }

    public String getRating() { return rating; }
    public void setRating(String rating) { this.rating = rating; }

    public Double getStabilityBefore() { return stabilityBefore; }
    public void setStabilityBefore(Double stabilityBefore) { this.stabilityBefore = stabilityBefore; }

    public Double getDifficultyBefore() { return difficultyBefore; }
    public void setDifficultyBefore(Double difficultyBefore) { this.difficultyBefore = difficultyBefore; }

    public Integer getElapsedDays() { return elapsedDays; }
    public void setElapsedDays(Integer elapsedDays) { this.elapsedDays = elapsedDays; }

    public Integer getScheduledDays() { return scheduledDays; }
    public void setScheduledDays(Integer scheduledDays) { this.scheduledDays = scheduledDays; }

    public LocalDateTime getReviewTime() { return reviewTime; }
    public void setReviewTime(LocalDateTime reviewTime) { this.reviewTime = reviewTime; }
}

