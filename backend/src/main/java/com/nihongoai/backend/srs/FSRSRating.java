package com.nihongoai.backend.srs;

public enum FSRSRating {
    AGAIN(1),
    HARD(2),
    GOOD(3),
    EASY(4);

    private final int value;

    FSRSRating(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static FSRSRating fromString(String ratingStr) {
        if (ratingStr == null) return GOOD;
        try {
            return FSRSRating.valueOf(ratingStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return switch (ratingStr.trim()) {
                case "1" -> AGAIN;
                case "2" -> HARD;
                case "4" -> EASY;
                default -> GOOD;
            };
        }
    }
}
