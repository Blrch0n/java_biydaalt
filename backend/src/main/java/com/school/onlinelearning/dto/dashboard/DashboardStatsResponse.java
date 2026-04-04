package com.school.onlinelearning.dto.dashboard;

public class DashboardStatsResponse {

	private long totalStudents;
	private long totalCourses;
	private long totalEnrollments;
	private double averageProgress;
	private String courseWithMostLessonsTitle;
	private int courseWithMostLessonsCount;

	public DashboardStatsResponse() {
	}

	public DashboardStatsResponse(
			long totalStudents,
			long totalCourses,
			long totalEnrollments,
			double averageProgress,
			String courseWithMostLessonsTitle,
			int courseWithMostLessonsCount
	) {
		this.totalStudents = totalStudents;
		this.totalCourses = totalCourses;
		this.totalEnrollments = totalEnrollments;
		this.averageProgress = averageProgress;
		this.courseWithMostLessonsTitle = courseWithMostLessonsTitle;
		this.courseWithMostLessonsCount = courseWithMostLessonsCount;
	}

	public long getTotalStudents() {
		return totalStudents;
	}

	public void setTotalStudents(long totalStudents) {
		this.totalStudents = totalStudents;
	}

	public long getTotalCourses() {
		return totalCourses;
	}

	public void setTotalCourses(long totalCourses) {
		this.totalCourses = totalCourses;
	}

	public long getTotalEnrollments() {
		return totalEnrollments;
	}

	public void setTotalEnrollments(long totalEnrollments) {
		this.totalEnrollments = totalEnrollments;
	}

	public double getAverageProgress() {
		return averageProgress;
	}

	public void setAverageProgress(double averageProgress) {
		this.averageProgress = averageProgress;
	}

	public String getCourseWithMostLessonsTitle() {
		return courseWithMostLessonsTitle;
	}

	public void setCourseWithMostLessonsTitle(String courseWithMostLessonsTitle) {
		this.courseWithMostLessonsTitle = courseWithMostLessonsTitle;
	}

	public int getCourseWithMostLessonsCount() {
		return courseWithMostLessonsCount;
	}

	public void setCourseWithMostLessonsCount(int courseWithMostLessonsCount) {
		this.courseWithMostLessonsCount = courseWithMostLessonsCount;
	}
}
