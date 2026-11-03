package com.nihongoai.backend.srs;

import java.time.LocalDateTime;

public record FSRSResult(
    double stability,
    double difficulty,
    int reps,
    int lapses,
    FSRSState state,
    int scheduledDays,
    LocalDateTime nextDue
) {}
