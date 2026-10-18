package com.nihongoai.backend.ai;

import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class LocalMockAiProvider implements AiProvider {

    @Override
    public String getProviderName() {
        return "local-mock";
    }

    @Override
    public PracticeQuestionDto generateExercise(List<String> targetVocab, List<String> targetGrammar, String level) {
        String vocab1 = (targetVocab != null && !targetVocab.isEmpty()) ? targetVocab.get(0) : "映画";
        String vocab2 = (targetVocab != null && targetVocab.size() > 1) ? targetVocab.get(1) : "見る";
        String grammar = (targetGrammar != null && !targetGrammar.isEmpty()) ? targetGrammar.get(0) : "～たことがある";

        return new PracticeQuestionDto(
                "Tôi đã từng xem bộ phim này cùng với bạn bè.",
                "友達とこの" + vocab1 + "を" + vocab2 + "たことがあります。",
                (targetVocab != null && !targetVocab.isEmpty()) ? targetVocab : List.of("映画", "見る", "友達"),
                (targetGrammar != null && !targetGrammar.isEmpty()) ? targetGrammar : List.of("～たことがある"),
                level != null ? level : "N4"
        );
    }

    @Override
    public EvaluationResultDto evaluateAnswer(String sentenceVi, String exampleJa, String userAnswer, String level) {
        boolean hasTargetGrammar = userAnswer.contains("たことがある") || userAnswer.contains("たことがあり");
        boolean hasVocabulary = userAnswer.contains("映画") || userAnswer.contains("見");

        boolean isPass = hasTargetGrammar || hasVocabulary;

        int score = isPass ? 92 : 60;
        int meaningScore = isPass ? 95 : 65;
        int grammarScore = hasTargetGrammar ? 94 : 55;
        int naturalnessScore = isPass ? 88 : 60;

        String explanation = isPass
                ? "Câu của bạn rất chính xác và tự nhiên! Bạn đã sử dụng thành thạo cấu trúc kinh nghiệm 「～たことがある」 cùng các từ vựng mục tiêu."
                : "Câu trả lời của bạn cần lưu ý: Cấu trúc kinh nghiệm quá khứ tiếng Nhật là Động từ thể Ta + ことがある (ví dụ: 見たことがあります).";

        return new EvaluationResultDto(
                isPass,
                score,
                meaningScore,
                grammarScore,
                naturalnessScore,
                exampleJa != null ? exampleJa : "友達とこの映画を見たことがあります。",
                explanation
        );
    }

    @Override
    public KaiwaResponseDto chatKaiwa(String userMessage, String level) {
        return new KaiwaResponseDto(
                "京都へ行ったことがありますか。とてもきれいな街ですよ。",
                "Câu trả lời của bạn rất tốt! AI gợi ý câu đàm thoại nối tiếp sử dụng cấu trúc kinh nghiệm 「～へ行ったことがありますか」."
        );
    }
}
