package com.school.onlinelearning.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.school.onlinelearning.dto.auth.SignupRequest;
import com.school.onlinelearning.dto.auth.UserResponse;
import com.school.onlinelearning.model.UserRole;
import com.school.onlinelearning.security.CustomUserDetailsService;
import com.school.onlinelearning.security.JwtService;
import com.school.onlinelearning.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockBean
	private AuthService authService;

	@MockBean
	private JwtService jwtService;

	@MockBean
	private CustomUserDetailsService customUserDetailsService;

	@Test
	void signupReturnsCreatedUser() throws Exception {
		SignupRequest request = new SignupRequest();
		request.setFullName("Teacher One");
		request.setEmail("teacher@example.com");
		request.setPassword("secret123");
		request.setRole(UserRole.TEACHER);

		UserResponse response = new UserResponse("u1", "Teacher One", "teacher@example.com", UserRole.TEACHER);
		when(authService.signup(any(SignupRequest.class))).thenReturn(response);

		mockMvc.perform(post("/api/auth/signup")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").value("u1"))
				.andExpect(jsonPath("$.role").value("TEACHER"));
	}
}
