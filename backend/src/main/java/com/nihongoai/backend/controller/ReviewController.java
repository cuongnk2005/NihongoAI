package com.nihongoai.backend.controller;

import com.nihongoai.backend.entity.CardEntity;
import com.nihongoai.backend.service.ReviewService;
import com.nihongoai.backend.srs.FSRSResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/queue")
    public ResponseEntity<List<CardEntity>> getReviewQueue() {
        return ResponseEntity.ok(reviewService.getDueCards());
    }

    @PostMapping("/answer")
    public ResponseEntity<FSRSResult> answerReview(@RequestBody Map<String, Object> body) {
        Long cardId = Long.valueOf(body.get("cardId").toString());
        String rating = body.getOrDefault("rating", "GOOD").toString();
        FSRSResult result = reviewService.processAnswer(cardId, rating);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/undo")
    public ResponseEntity<Map<String, Object>> undoReview(@RequestBody Map<String, Object> body) {
        Long cardId = Long.valueOf(body.get("cardId").toString());
        boolean success = reviewService.undoLastReview(cardId);
        return ResponseEntity.ok(Map.of("success", success));
    }
}
