package com.nihongoai.backend.ai;

import java.util.List;

public record KanjiLookupDto(
        String word,
        String reading,
        String sinoVietnamese,
        String meaningVi,
        String jlptLevel,
        List<KanjiDetailDto> kanjiList
) {
    public record KanjiDetailDto(
            String charStr,
            String sino,
            String meaning
    ) {}
}
