package com.school.onlinelearning.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class Lesson {

	@NotBlank(message = "Lesson title is required")
	private String title;

	@Min(value = 1, message = "Duration must be greater than 0")
	private int durationMinutes;

	public Lesson() {
	}

	public Lesson(String title, int durationMinutes) {
		this.title = title;
		this.durationMinutes = durationMinutes;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public int getDurationMinutes() {
		return durationMinutes;
	}

	public void setDurationMinutes(int durationMinutes) {
		this.durationMinutes = durationMinutes;
	}
}
