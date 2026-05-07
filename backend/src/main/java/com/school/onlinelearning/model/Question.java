package com.school.onlinelearning.model;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class Question {
    @NotBlank(message = "Question text is required")
    private String text;

    private List<String> options;

    @NotBlank(message = "Correct answer is required")
    private String correctAnswer;

    public Question() {}

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
}
