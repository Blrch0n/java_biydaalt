package com.school.onlinelearning.dto.auth;

import com.school.onlinelearning.model.UserRole;

public class UserResponse {

	private String id;
	private String fullName;
	private String email;
	private UserRole role;

	public UserResponse() {
	}

	public UserResponse(String id, String fullName, String email, UserRole role) {
		this.id = id;
		this.fullName = fullName;
		this.email = email;
		this.role = role;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public UserRole getRole() {
		return role;
	}

	public void setRole(UserRole role) {
		this.role = role;
	}
}
