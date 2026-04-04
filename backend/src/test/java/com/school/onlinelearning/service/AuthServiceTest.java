package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.auth.AuthResponse;
import com.school.onlinelearning.dto.auth.LoginRequest;
import com.school.onlinelearning.dto.auth.SignupRequest;
import com.school.onlinelearning.dto.auth.UserResponse;
import com.school.onlinelearning.model.User;
import com.school.onlinelearning.model.UserRole;
import com.school.onlinelearning.repository.InstructorRepository;
import com.school.onlinelearning.repository.StudentRepository;
import com.school.onlinelearning.repository.UserRepository;
import com.school.onlinelearning.security.AuthenticatedUser;
import com.school.onlinelearning.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private StudentRepository studentRepository;

	@Mock
	private InstructorRepository instructorRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private JwtService jwtService;

	@InjectMocks
	private AuthService authService;

	@Test
	void signupAndLoginHappyPath() {
		SignupRequest signupRequest = new SignupRequest();
		signupRequest.setFullName("Student One");
		signupRequest.setEmail("student@example.com");
		signupRequest.setPassword("secret123");
		signupRequest.setRole(UserRole.STUDENT);

		when(userRepository.existsByEmail("student@example.com")).thenReturn(false);
		when(passwordEncoder.encode("secret123")).thenReturn("hashed-pass");
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
			User user = invocation.getArgument(0);
			user.setId("user-1");
			return user;
		});
		when(studentRepository.findByEmail("student@example.com")).thenReturn(Optional.empty());

		UserResponse userResponse = authService.signup(signupRequest);
		assertNotNull(userResponse);
		assertEquals("user-1", userResponse.getId());
		assertEquals(UserRole.STUDENT, userResponse.getRole());

		User storedUser = new User();
		storedUser.setId("user-1");
		storedUser.setFullName("Student One");
		storedUser.setEmail("student@example.com");
		storedUser.setPasswordHash("hashed-pass");
		storedUser.setRole(UserRole.STUDENT);

		when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(storedUser));
		when(passwordEncoder.matches("secret123", "hashed-pass")).thenReturn(true);
		when(jwtService.generateToken(any(AuthenticatedUser.class))).thenReturn("jwt-token");

		LoginRequest loginRequest = new LoginRequest();
		loginRequest.setEmail("student@example.com");
		loginRequest.setPassword("secret123");

		AuthResponse authResponse = authService.login(loginRequest);
		assertEquals("jwt-token", authResponse.getToken());
		assertEquals("student@example.com", authResponse.getUser().getEmail());

		ArgumentCaptor<AuthenticatedUser> captor = ArgumentCaptor.forClass(AuthenticatedUser.class);
		verify(jwtService).generateToken(captor.capture());
		assertEquals("student@example.com", captor.getValue().getUsername());
	}
}
