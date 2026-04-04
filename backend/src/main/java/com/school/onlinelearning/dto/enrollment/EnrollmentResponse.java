package com.school.onlinelearning.dto.enrollment;

import java.time.LocalDateTime;

public class EnrollmentResponse {

	private String id;
	private String studentId;
	private String studentName;
	private String courseId;
	private String courseTitle;
	private double progress;
	private LocalDateTime enrolledAt;

	public EnrollmentResponse() {
	}

	public EnrollmentResponse(
			String id,
			String studentId,
			String studentName,
			String courseId,
			String courseTitle,
			double progress,
			LocalDateTime enrolledAt
	) {
		this.id = id;
		this.studentId = studentId;
		this.studentName = studentName;
		this.courseId = courseId;
		this.courseTitle = courseTitle;
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

	public String getStudentName() {
		return studentName;
	}

	public void setStudentName(String studentName) {
		this.studentName = studentName;
	}

	public String getCourseId() {
		return courseId;
	}

	public void setCourseId(String courseId) {
		this.courseId = courseId;
	}

	public String getCourseTitle() {
		return courseTitle;
	}

	public void setCourseTitle(String courseTitle) {
		this.courseTitle = courseTitle;
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
