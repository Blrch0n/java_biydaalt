package com.school.onlinelearning.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "enrollments")
public class Enrollment {

	@Id
	private String id;

	@NotBlank(message = "Student ID is required")
	private String studentId;

	@NotBlank(message = "Course ID is required")
	private String courseId;

	@Min(value = 0, message = "Progress must be between 0 and 100")
	@Max(value = 100, message = "Progress must be between 0 and 100")
	private double progress;

	private LocalDateTime enrolledAt;

	public Enrollment() {
	}

	public Enrollment(String id, String studentId, String courseId, double progress, LocalDateTime enrolledAt) {
		this.id = id;
		this.studentId = studentId;
		this.courseId = courseId;
		this.progress = progress;
		this.enrolledAt = enrolledAt;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getStudentId() {
		return studentId;
	}

	public void setStudentId(String studentId) {
		this.studentId = studentId;
	}

	public String getCourseId() {
		return courseId;
	}

	public void setCourseId(String courseId) {
		this.courseId = courseId;
	}

	public double getProgress() {
		return progress;
	}

	public void setProgress(double progress) {
		this.progress = progress;
	}

	public LocalDateTime getEnrolledAt() {
		return enrolledAt;
	}

	public void setEnrolledAt(LocalDateTime enrolledAt) {
		this.enrolledAt = enrolledAt;
	}
}
