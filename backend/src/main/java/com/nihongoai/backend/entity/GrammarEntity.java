package com.nihongoai.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "grammar")
public class GrammarEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String pattern;

    @Column(name = "meaning_vi", nullable = false)
    private String meaningVi;

    @Column
    private String structure;

    @Column
    private String explanation;

    @Column(name = "jlpt_level", nullable = false)
    private String jlptLevel = "N5";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public GrammarEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPattern() { return pattern; }
    public void setPattern(String pattern) { this.pattern = pattern; }

    public String getMeaningVi() { return meaningVi; }
    public void setMeaningVi(String meaningVi) { this.meaningVi = meaningVi; }

    public String getStructure() { return structure; }
    public void setStructure(String structure) { this.structure = structure; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getJlptLevel() { return jlptLevel; }
    public void setJlptLevel(String jlptLevel) { this.jlptLevel = jlptLevel; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
