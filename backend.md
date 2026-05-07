# Backend Source Dump

This file contains backend source code from the onlinelearning package and backend resources.

## backend/src/main/java/com/school/onlinelearning/config/CorsConfig.java

```java
package com.school.onlinelearning.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

	private final String[] allowedOrigins;

	public CorsConfig(@Value("${app.cors.allowed-origins:http://localhost:3000}") String allowedOrigins) {
		this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
				.map(String::trim)
				.filter(value -> !value.isEmpty())
				.toArray(String[]::new);
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
				.allowedOrigins(allowedOrigins)
				.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
				.allowedHeaders("*")
				.exposedHeaders("Authorization");
	}
}

```

## backend/src/main/java/com/school/onlinelearning/config/SecurityConfig.java

```java
package com.school.onlinelearning.config;

import com.school.onlinelearning.security.JwtAuthenticationFilter;
import com.school.onlinelearning.security.RestAccessDeniedHandler;
import com.school.onlinelearning.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final RestAuthenticationEntryPoint authenticationEntryPoint;
	private final RestAccessDeniedHandler accessDeniedHandler;

	public SecurityConfig(
			JwtAuthenticationFilter jwtAuthenticationFilter,
			RestAuthenticationEntryPoint authenticationEntryPoint,
			RestAccessDeniedHandler accessDeniedHandler
	) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
		this.authenticationEntryPoint = authenticationEntryPoint;
		this.accessDeniedHandler = accessDeniedHandler;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(Customizer.withDefaults())
				.csrf(csrf -> csrf.disable())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling(ex -> ex
						.authenticationEntryPoint(authenticationEntryPoint)
						.accessDeniedHandler(accessDeniedHandler)
				)
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/auth/signup", "/api/auth/login").permitAll()
						.anyRequest().authenticated()
				)
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}

```

## backend/src/main/java/com/school/onlinelearning/controller/AuthController.java

```java
package com.school.onlinelearning.controller;

import com.school.onlinelearning.dto.auth.AuthResponse;
import com.school.onlinelearning.dto.auth.LoginRequest;
import com.school.onlinelearning.dto.auth.SignupRequest;
import com.school.onlinelearning.dto.auth.UserResponse;
import com.school.onlinelearning.security.AuthenticatedUser;
import com.school.onlinelearning.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/signup")
	public ResponseEntity<UserResponse> signup(@Valid @RequestBody SignupRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
		return ResponseEntity.ok(authService.login(request));
	}

	@GetMapping("/me")
	public ResponseEntity<UserResponse> me(@AuthenticationPrincipal AuthenticatedUser currentUser) {
		return ResponseEntity.ok(authService.me(currentUser));
	}
}

```

## backend/src/main/java/com/school/onlinelearning/controller/CourseController.java

```java
package com.school.onlinelearning.controller;

import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Lesson;
import com.school.onlinelearning.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

	private final CourseService courseService;

	public CourseController(CourseService courseService) {
		this.courseService = courseService;
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
	@GetMapping
	public ResponseEntity<List<Course>> getAllCourses(@RequestParam(required = false) String level) {
		return ResponseEntity.ok(courseService.getAllCourses(level));
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
	@GetMapping("/{id}")
	public ResponseEntity<Course> getCourseById(@PathVariable String id) {
		return ResponseEntity.ok(courseService.getCourseById(id));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PostMapping
	public ResponseEntity<Course> createCourse(@Valid @RequestBody Course course) {
		Course createdCourse = courseService.createCourse(course);
		return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse);
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PutMapping("/{id}")
	public ResponseEntity<Course> updateCourse(@PathVariable String id, @Valid @RequestBody Course course) {
		return ResponseEntity.ok(courseService.updateCourse(id, course));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteCourse(@PathVariable String id) {
		courseService.deleteCourse(id);
		return ResponseEntity.noContent().build();
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PostMapping("/{courseId}/lessons")
	public ResponseEntity<Course> addLesson(@PathVariable String courseId, @Valid @RequestBody Lesson lesson) {
		return ResponseEntity.ok(courseService.addLesson(courseId, lesson));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@DeleteMapping("/{courseId}/lessons/{lessonIndex}")
	public ResponseEntity<Course> removeLesson(@PathVariable String courseId, @PathVariable int lessonIndex) {
		return ResponseEntity.ok(courseService.removeLesson(courseId, lessonIndex));
	}
}

```

## backend/src/main/java/com/school/onlinelearning/controller/DashboardController.java

```java
package com.school.onlinelearning.controller;

import com.school.onlinelearning.dto.dashboard.DashboardStatsResponse;
import com.school.onlinelearning.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

	private final DashboardService dashboardService;

	public DashboardController(DashboardService dashboardService) {
		this.dashboardService = dashboardService;
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
	@GetMapping("/stats")
	public ResponseEntity<DashboardStatsResponse> getStats() {
		return ResponseEntity.ok(dashboardService.getStats());
	}
}

```

## backend/src/main/java/com/school/onlinelearning/controller/EnrollmentController.java

```java
package com.school.onlinelearning.controller;

import com.school.onlinelearning.dto.enrollment.EnrollmentResponse;
import com.school.onlinelearning.model.Enrollment;
import com.school.onlinelearning.security.AuthenticatedUser;
import com.school.onlinelearning.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

	private final EnrollmentService enrollmentService;

	public EnrollmentController(EnrollmentService enrollmentService) {
		this.enrollmentService = enrollmentService;
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
	@GetMapping
	public ResponseEntity<List<EnrollmentResponse>> getAllEnrollments(
			@AuthenticationPrincipal AuthenticatedUser currentUser,
			@RequestParam(required = false) String sort
	) {
		return ResponseEntity.ok(enrollmentService.getAllEnrollments(currentUser, sort));
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
	@GetMapping("/{id}")
	public ResponseEntity<EnrollmentResponse> getEnrollmentById(
			@PathVariable String id,
			@AuthenticationPrincipal AuthenticatedUser currentUser
	) {
		return ResponseEntity.ok(enrollmentService.getEnrollmentById(id, currentUser));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PostMapping
	public ResponseEntity<EnrollmentResponse> createEnrollment(@Valid @RequestBody Enrollment enrollment) {
		EnrollmentResponse createdEnrollment = enrollmentService.createEnrollment(enrollment);
		return ResponseEntity.status(HttpStatus.CREATED).body(createdEnrollment);
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PatchMapping("/{id}/progress")
	public ResponseEntity<EnrollmentResponse> updateProgress(@PathVariable String id, @RequestParam("value") double value) {
		EnrollmentResponse updatedEnrollment = enrollmentService.updateProgress(id, value);
		return ResponseEntity.ok(updatedEnrollment);
	}

	@PreAuthorize("hasRole('TEACHER')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteEnrollment(@PathVariable String id) {
		enrollmentService.deleteEnrollment(id);
		return ResponseEntity.noContent().build();
	}
}

```

## backend/src/main/java/com/school/onlinelearning/controller/InstructorController.java

```java
package com.school.onlinelearning.controller;

import com.school.onlinelearning.model.Instructor;
import com.school.onlinelearning.service.InstructorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/instructors")
public class InstructorController {

	private final InstructorService instructorService;

	public InstructorController(InstructorService instructorService) {
		this.instructorService = instructorService;
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
	@GetMapping
	public ResponseEntity<List<Instructor>> getAllInstructors() {
		return ResponseEntity.ok(instructorService.getAllInstructors());
	}

	@PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
	@GetMapping("/{id}")
	public ResponseEntity<Instructor> getInstructorById(@PathVariable String id) {
		return ResponseEntity.ok(instructorService.getInstructorById(id));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PostMapping
	public ResponseEntity<Instructor> createInstructor(@Valid @RequestBody Instructor instructor) {
		return ResponseEntity.status(HttpStatus.CREATED).body(instructorService.createInstructor(instructor));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PutMapping("/{id}")
	public ResponseEntity<Instructor> updateInstructor(@PathVariable String id, @Valid @RequestBody Instructor instructor) {
		return ResponseEntity.ok(instructorService.updateInstructor(id, instructor));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteInstructor(@PathVariable String id) {
		instructorService.deleteInstructor(id);
		return ResponseEntity.noContent().build();
	}
}

```

## backend/src/main/java/com/school/onlinelearning/controller/StudentController.java

```java
package com.school.onlinelearning.controller;

import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

	private final StudentService studentService;

	public StudentController(StudentService studentService) {
		this.studentService = studentService;
	}

	@PreAuthorize("hasRole('TEACHER')")
	@GetMapping
	public ResponseEntity<List<Student>> getAllStudents(@RequestParam(required = false) String search) {
		return ResponseEntity.ok(studentService.getAllStudents(search));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@GetMapping("/{id}")
	public ResponseEntity<Student> getStudentById(@PathVariable String id) {
		return ResponseEntity.ok(studentService.getStudentById(id));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PostMapping
	public ResponseEntity<Student> createStudent(@Valid @RequestBody Student student) {
		return ResponseEntity.status(HttpStatus.CREATED).body(studentService.createStudent(student));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@PutMapping("/{id}")
	public ResponseEntity<Student> updateStudent(@PathVariable String id, @Valid @RequestBody Student student) {
		return ResponseEntity.ok(studentService.updateStudent(id, student));
	}

	@PreAuthorize("hasRole('TEACHER')")
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
		studentService.deleteStudent(id);
		return ResponseEntity.noContent().build();
	}
}

```

## backend/src/main/java/com/school/onlinelearning/dto/auth/AuthResponse.java

```java
package com.school.onlinelearning.dto.auth;

public class AuthResponse {

	private String token;
	private UserResponse user;

	public AuthResponse() {
	}

	public AuthResponse(String token, UserResponse user) {
		this.token = token;
		this.user = user;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public UserResponse getUser() {
		return user;
	}

	public void setUser(UserResponse user) {
		this.user = user;
	}
}

```

## backend/src/main/java/com/school/onlinelearning/dto/auth/LoginRequest.java

```java
package com.school.onlinelearning.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

	@NotBlank(message = "Email is required")
	@Email(message = "Email must be valid")
	private String email;

	@NotBlank(message = "Password is required")
	private String password;

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
}

```

## backend/src/main/java/com/school/onlinelearning/dto/auth/SignupRequest.java

```java
package com.school.onlinelearning.dto.auth;

import com.school.onlinelearning.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SignupRequest {

	@NotBlank(message = "Full name is required")
	private String fullName;

	@NotBlank(message = "Email is required")
	@Email(message = "Email must be valid")
	private String email;

	@NotBlank(message = "Password is required")
	@Size(min = 6, message = "Password must be at least 6 characters")
	private String password;

	@NotNull(message = "Role is required")
	private UserRole role;

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

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public UserRole getRole() {
		return role;
	}

	public void setRole(UserRole role) {
		this.role = role;
	}
}

```

## backend/src/main/java/com/school/onlinelearning/dto/auth/UserResponse.java

```java
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

```

## backend/src/main/java/com/school/onlinelearning/dto/dashboard/DashboardStatsResponse.java

```java
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

```

## backend/src/main/java/com/school/onlinelearning/dto/enrollment/EnrollmentResponse.java

```java
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

```

## backend/src/main/java/com/school/onlinelearning/exception/ApiErrorResponse.java

```java
package com.school.onlinelearning.exception;

import java.time.LocalDateTime;

public class ApiErrorResponse {

	private LocalDateTime timestamp;
	private int status;
	private String error;
	private String message;
	private String path;

	public ApiErrorResponse() {
	}

	public ApiErrorResponse(LocalDateTime timestamp, int status, String error, String message, String path) {
		this.timestamp = timestamp;
		this.status = status;
		this.error = error;
		this.message = message;
		this.path = path;
	}

	public LocalDateTime getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public String getError() {
		return error;
	}

	public void setError(String error) {
		this.error = error;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}
}

```

## backend/src/main/java/com/school/onlinelearning/exception/DuplicateResourceException.java

```java
package com.school.onlinelearning.exception;

public class DuplicateResourceException extends RuntimeException {
	public DuplicateResourceException(String message) {
		super(message);
	}
}

```

## backend/src/main/java/com/school/onlinelearning/exception/GlobalExceptionHandler.java

```java
package com.school.onlinelearning.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
		return build(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
	}

	@ExceptionHandler(DuplicateResourceException.class)
	public ResponseEntity<ApiErrorResponse> handleDuplicate(DuplicateResourceException ex, HttpServletRequest request) {
		return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
		return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
		String message = ex.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(this::formatFieldError)
				.collect(Collectors.joining("; "));
		return build(HttpStatus.BAD_REQUEST, message, request.getRequestURI());
	}

	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<ApiErrorResponse> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
		return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
		return build(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error", request.getRequestURI());
	}

	private String formatFieldError(FieldError fieldError) {
		return fieldError.getField() + ": " + fieldError.getDefaultMessage();
	}

	private ResponseEntity<ApiErrorResponse> build(HttpStatus status, String message, String path) {
		ApiErrorResponse body = new ApiErrorResponse(
				LocalDateTime.now(),
				status.value(),
				status.getReasonPhrase(),
				message,
				path
		);
		return ResponseEntity.status(status).body(body);
	}
}

```

## backend/src/main/java/com/school/onlinelearning/exception/ResourceNotFoundException.java

```java
package com.school.onlinelearning.exception;

public class ResourceNotFoundException extends RuntimeException {
	public ResourceNotFoundException(String message) {
		super(message);
	}
}

```

## backend/src/main/java/com/school/onlinelearning/model/Course.java

```java
package com.school.onlinelearning.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "courses")
public class Course {

	@Id
	private String id;

	@NotBlank(message = "Title is required")
	private String title;

	@NotBlank(message = "Description is required")
	private String description;

	@NotBlank(message = "Level is required")
	private String level;

	@Min(value = 0, message = "Price must be greater than or equal to 0")
	private double price;

	@NotBlank(message = "Instructor ID is required")
	private String instructorId;

	@Valid
	private List<Lesson> lessons;

	public Course() {
		this.lessons = new ArrayList<>();
	}

	public Course(String id, String title, String description, String level, double price, String instructorId, List<Lesson> lessons) {
		this.id = id;
		this.title = title;
		this.description = description;
		this.level = level;
		this.price = price;
		this.instructorId = instructorId;
		this.lessons = lessons != null ? lessons : new ArrayList<>();
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	public String getInstructorId() {
		return instructorId;
	}

	public void setInstructorId(String instructorId) {
		this.instructorId = instructorId;
	}

	public List<Lesson> getLessons() {
		if (lessons == null) {
			lessons = new ArrayList<>();
		}
		return lessons;
	}

	public void setLessons(List<Lesson> lessons) {
		this.lessons = lessons != null ? lessons : new ArrayList<>();
	}
}

```

## backend/src/main/java/com/school/onlinelearning/model/Enrollment.java

```java
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

```

## backend/src/main/java/com/school/onlinelearning/model/Instructor.java

```java
package com.school.onlinelearning.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "instructors")
public class Instructor {

	@Id
	private String id;

	private String userId;

	@NotBlank(message = "Full name is required")
	private String fullName;

	@NotBlank(message = "Email is required")
	@Email(message = "Email must be valid")
	private String email;

	@NotBlank(message = "Specialization is required")
	private String specialization;

	public Instructor() {
	}

	public Instructor(String id, String userId, String fullName, String email, String specialization) {
		this.id = id;
		this.userId = userId;
		this.fullName = fullName;
		this.email = email;
		this.specialization = specialization;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
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

	public String getSpecialization() {
		return specialization;
	}

	public void setSpecialization(String specialization) {
		this.specialization = specialization;
	}
}

```

## backend/src/main/java/com/school/onlinelearning/model/Lesson.java

```java
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

```

## backend/src/main/java/com/school/onlinelearning/model/Student.java

```java
package com.school.onlinelearning.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "students")
public class Student {

	@Id
	private String id;

	private String userId;

	@NotBlank(message = "Full name is required")
	private String fullName;

	@NotBlank(message = "Email is required")
	@Email(message = "Email must be valid")
	private String email;

	@NotBlank(message = "Batch is required")
	private String batch;

	public Student() {
	}

	public Student(String id, String userId, String fullName, String email, String batch) {
		this.id = id;
		this.userId = userId;
		this.fullName = fullName;
		this.email = email;
		this.batch = batch;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
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

	public String getBatch() {
		return batch;
	}

	public void setBatch(String batch) {
		this.batch = batch;
	}
}

```

## backend/src/main/java/com/school/onlinelearning/model/User.java

```java
package com.school.onlinelearning.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
public class User {

	@Id
	private String id;

	@NotBlank(message = "Full name is required")
	private String fullName;

	@NotBlank(message = "Email is required")
	@Email(message = "Email must be valid")
	private String email;

	@NotBlank(message = "Password hash is required")
	private String passwordHash;

	@NotNull(message = "Role is required")
	private UserRole role;

	private LocalDateTime createdAt;

	public User() {
	}

	public User(String id, String fullName, String email, String passwordHash, UserRole role, LocalDateTime createdAt) {
		this.id = id;
		this.fullName = fullName;
		this.email = email;
		this.passwordHash = passwordHash;
		this.role = role;
		this.createdAt = createdAt;
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

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public UserRole getRole() {
		return role;
	}

	public void setRole(UserRole role) {
		this.role = role;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}

```

## backend/src/main/java/com/school/onlinelearning/model/UserRole.java

```java
package com.school.onlinelearning.model;

public enum UserRole {
	STUDENT,
	TEACHER
}

```

## backend/src/main/java/com/school/onlinelearning/OnlinelearningApplication.java

```java
package com.school.onlinelearning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OnlinelearningApplication {

	public static void main(String[] args) {
		SpringApplication.run(OnlinelearningApplication.class, args);
	}

}

```

## backend/src/main/java/com/school/onlinelearning/repository/CourseRepository.java

```java
package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Course;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CourseRepository extends MongoRepository<Course, String> {
	List<Course> findByLevelIgnoreCase(String level);
}

```

## backend/src/main/java/com/school/onlinelearning/repository/EnrollmentRepository.java

```java
package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Enrollment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EnrollmentRepository extends MongoRepository<Enrollment, String> {
	boolean existsByStudentIdAndCourseId(String studentId, String courseId);

	List<Enrollment> findByStudentId(String studentId);

	List<Enrollment> findByCourseId(String courseId);

	List<Enrollment> findAllByOrderByProgressDesc();

	List<Enrollment> findAllByOrderByEnrolledAtDesc();

	List<Enrollment> findByStudentIdOrderByProgressDesc(String studentId);

	List<Enrollment> findByStudentIdOrderByEnrolledAtDesc(String studentId);
}

```

## backend/src/main/java/com/school/onlinelearning/repository/InstructorRepository.java

```java
package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Instructor;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface InstructorRepository extends MongoRepository<Instructor, String> {
	boolean existsByEmail(String email);

	Optional<Instructor> findByEmail(String email);
}

```

## backend/src/main/java/com/school/onlinelearning/repository/StudentRepository.java

```java
package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends MongoRepository<Student, String> {
	boolean existsByEmail(String email);

	Optional<Student> findByEmail(String email);

	Optional<Student> findByUserId(String userId);

	List<Student> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String fullName, String email);
}

```

## backend/src/main/java/com/school/onlinelearning/repository/UserRepository.java

```java
package com.school.onlinelearning.repository;

import com.school.onlinelearning.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
	boolean existsByEmail(String email);

	Optional<User> findByEmail(String email);
}

```

## backend/src/main/java/com/school/onlinelearning/security/AuthenticatedUser.java

```java
package com.school.onlinelearning.security;

import com.school.onlinelearning.model.UserRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class AuthenticatedUser implements UserDetails {

	private final String id;
	private final String email;
	private final String passwordHash;
	private final String fullName;
	private final UserRole role;

	public AuthenticatedUser(String id, String email, String passwordHash, String fullName, UserRole role) {
		this.id = id;
		this.email = email;
		this.passwordHash = passwordHash;
		this.fullName = fullName;
		this.role = role;
	}

	public String getId() {
		return id;
	}

	public String getFullName() {
		return fullName;
	}

	public UserRole getRole() {
		return role;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
	}

	@Override
	public String getPassword() {
		return passwordHash;
	}

	@Override
	public String getUsername() {
		return email;
	}
}

```

## backend/src/main/java/com/school/onlinelearning/security/CustomUserDetailsService.java

```java
package com.school.onlinelearning.security;

import com.school.onlinelearning.model.User;
import com.school.onlinelearning.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	public CustomUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

		return new AuthenticatedUser(
				user.getId(),
				user.getEmail(),
				user.getPasswordHash(),
				user.getFullName(),
				user.getRole()
		);
	}
}

```

## backend/src/main/java/com/school/onlinelearning/security/JwtAuthenticationFilter.java

```java
package com.school.onlinelearning.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final CustomUserDetailsService userDetailsService;

	public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
		this.jwtService = jwtService;
		this.userDetailsService = userDetailsService;
	}

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain
	) throws ServletException, IOException {
		String token = extractBearerToken(request);
		if (token == null) {
			filterChain.doFilter(request, response);
			return;
		}

		if (SecurityContextHolder.getContext().getAuthentication() != null) {
			filterChain.doFilter(request, response);
			return;
		}

		String email = extractEmailSafely(token);
		if (email != null) {
			setAuthenticationIfTokenValid(email, token, request);
		}

		filterChain.doFilter(request, response);
	}

	private String extractBearerToken(HttpServletRequest request) {
		String authHeader = request.getHeader("Authorization");
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			return null;
		}
		return authHeader.substring(7);
	}

	private String extractEmailSafely(String token) {
		try {
			return jwtService.extractEmail(token);
		} catch (Exception ex) {
			return null;
		}
	}

	private void setAuthenticationIfTokenValid(String email, String token, HttpServletRequest request) {
		UserDetails userDetails = userDetailsService.loadUserByUsername(email);
		AuthenticatedUser authenticatedUser = (AuthenticatedUser) userDetails;
		if (!jwtService.isTokenValid(token, authenticatedUser)) {
			return;
		}

		UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
				authenticatedUser,
				null,
				authenticatedUser.getAuthorities()
		);
		authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
		SecurityContextHolder.getContext().setAuthentication(authToken);
	}
}

```

## backend/src/main/java/com/school/onlinelearning/security/JwtService.java

```java
package com.school.onlinelearning.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

	private final SecretKey secretKey;
	private final long expirationMs;

	public JwtService(
			@Value("${jwt.secret}") String jwtSecret,
			@Value("${jwt.expiration-ms:86400000}") long expirationMs
	) {
		this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
		this.expirationMs = expirationMs;
	}

	public String generateToken(AuthenticatedUser user) {
		Instant now = Instant.now();
		return Jwts.builder()
				.subject(user.getUsername())
				.claim("userId", user.getId())
				.claim("role", user.getRole().name())
				.issuedAt(Date.from(now))
				.expiration(Date.from(now.plusMillis(expirationMs)))
				.signWith(secretKey)
				.compact();
	}

	public String extractEmail(String token) {
		return parseClaims(token).getSubject();
	}

	public boolean isTokenValid(String token, AuthenticatedUser user) {
		String email = extractEmail(token);
		return email.equals(user.getUsername()) && !isTokenExpired(token);
	}

	private boolean isTokenExpired(String token) {
		Date expiration = parseClaims(token).getExpiration();
		return expiration.before(new Date());
	}

	private Claims parseClaims(String token) {
		return Jwts.parser()
				.verifyWith(secretKey)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}
}

```

## backend/src/main/java/com/school/onlinelearning/security/RestAccessDeniedHandler.java

```java
package com.school.onlinelearning.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.school.onlinelearning.exception.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

	private final ObjectMapper objectMapper;

	public RestAccessDeniedHandler(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	@Override
	public void handle(
			HttpServletRequest request,
			HttpServletResponse response,
			AccessDeniedException accessDeniedException
	) throws IOException {
		ApiErrorResponse body = new ApiErrorResponse(
				LocalDateTime.now(),
				HttpStatus.FORBIDDEN.value(),
				HttpStatus.FORBIDDEN.getReasonPhrase(),
				"You do not have permission to access this resource",
				request.getRequestURI()
		);

		response.setStatus(HttpStatus.FORBIDDEN.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		objectMapper.writeValue(response.getOutputStream(), body);
	}
}

```

## backend/src/main/java/com/school/onlinelearning/security/RestAuthenticationEntryPoint.java

```java
package com.school.onlinelearning.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.school.onlinelearning.exception.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

	private final ObjectMapper objectMapper;

	public RestAuthenticationEntryPoint(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	@Override
	public void commence(
			HttpServletRequest request,
			HttpServletResponse response,
			AuthenticationException authException
	) throws IOException {
		ApiErrorResponse body = new ApiErrorResponse(
				LocalDateTime.now(),
				HttpStatus.UNAUTHORIZED.value(),
				HttpStatus.UNAUTHORIZED.getReasonPhrase(),
				"Authentication is required",
				request.getRequestURI()
		);

		response.setStatus(HttpStatus.UNAUTHORIZED.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		objectMapper.writeValue(response.getOutputStream(), body);
	}
}

```

## backend/src/main/java/com/school/onlinelearning/service/AuthService.java

```java
package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.auth.AuthResponse;
import com.school.onlinelearning.dto.auth.LoginRequest;
import com.school.onlinelearning.dto.auth.SignupRequest;
import com.school.onlinelearning.dto.auth.UserResponse;
import com.school.onlinelearning.exception.DuplicateResourceException;
import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Instructor;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.model.User;
import com.school.onlinelearning.model.UserRole;
import com.school.onlinelearning.repository.InstructorRepository;
import com.school.onlinelearning.repository.StudentRepository;
import com.school.onlinelearning.repository.UserRepository;
import com.school.onlinelearning.security.AuthenticatedUser;
import com.school.onlinelearning.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final StudentRepository studentRepository;
	private final InstructorRepository instructorRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(
			UserRepository userRepository,
			StudentRepository studentRepository,
			InstructorRepository instructorRepository,
			PasswordEncoder passwordEncoder,
			JwtService jwtService
	) {
		this.userRepository = userRepository;
		this.studentRepository = studentRepository;
		this.instructorRepository = instructorRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	public UserResponse signup(SignupRequest request) {
		String email = normalizeEmail(request.getEmail());
		if (userRepository.existsByEmail(email)) {
			throw new DuplicateResourceException("User email already exists: " + email);
		}

		User saved = userRepository.save(buildUserForSignup(request, email));

		if (saved.getRole() == UserRole.STUDENT) {
			ensureStudentProfile(saved);
		} else if (saved.getRole() == UserRole.TEACHER) {
			ensureInstructorProfile(saved);
		}

		return toUserResponse(saved);
	}

	public AuthResponse login(LoginRequest request) {
		String email = normalizeEmail(request.getEmail());
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

		validatePassword(request.getPassword(), user.getPasswordHash());

		AuthenticatedUser authenticatedUser = toAuthenticatedUser(user);
		String token = jwtService.generateToken(authenticatedUser);
		return new AuthResponse(token, toUserResponse(user));
	}

	public UserResponse me(AuthenticatedUser currentUser) {
		User user = userRepository.findById(currentUser.getId())
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		return toUserResponse(user);
	}

	private UserResponse toUserResponse(User user) {
		return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole());
	}

	private User buildUserForSignup(SignupRequest request, String email) {
		User user = new User();
		user.setFullName(request.getFullName().trim());
		user.setEmail(email);
		user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
		user.setRole(request.getRole());
		user.setCreatedAt(LocalDateTime.now());
		return user;
	}

	private AuthenticatedUser toAuthenticatedUser(User user) {
		return new AuthenticatedUser(
				user.getId(),
				user.getEmail(),
				user.getPasswordHash(),
				user.getFullName(),
				user.getRole()
		);
	}

	private void validatePassword(String rawPassword, String storedPasswordHash) {
		if (!passwordEncoder.matches(rawPassword, storedPasswordHash)) {
			throw new IllegalArgumentException("Invalid email or password");
		}
	}

	private String normalizeEmail(String email) {
		return email.trim().toLowerCase();
	}

	private void ensureStudentProfile(User user) {
		Student student = studentRepository.findByEmail(user.getEmail()).orElseGet(Student::new);
		student.setUserId(user.getId());
		student.setFullName(user.getFullName());
		student.setEmail(user.getEmail());
		if (student.getBatch() == null || student.getBatch().isBlank()) {
			student.setBatch("UNASSIGNED");
		}
		studentRepository.save(student);
	}

	private void ensureInstructorProfile(User user) {
		Instructor instructor = instructorRepository.findByEmail(user.getEmail()).orElseGet(Instructor::new);
		instructor.setUserId(user.getId());
		instructor.setFullName(user.getFullName());
		instructor.setEmail(user.getEmail());
		if (instructor.getSpecialization() == null || instructor.getSpecialization().isBlank()) {
			instructor.setSpecialization("General");
		}
		instructorRepository.save(instructor);
	}
}

```

## backend/src/main/java/com/school/onlinelearning/service/CourseService.java

```java
package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Lesson;
import com.school.onlinelearning.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

	private final CourseRepository courseRepository;

	public CourseService(CourseRepository courseRepository) {
		this.courseRepository = courseRepository;
	}

	public List<Course> getAllCourses(String level) {
		if (level != null && !level.isBlank()) {
			return courseRepository.findByLevelIgnoreCase(level);
		}
		return courseRepository.findAll();
	}

	public Course getCourseById(String id) {
		return courseRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
	}

	public Course createCourse(Course course) {
		return courseRepository.save(course);
	}

	public Course updateCourse(String id, Course payload) {
		Course existing = getCourseById(id);
		existing.setTitle(payload.getTitle());
		existing.setDescription(payload.getDescription());
		existing.setLevel(payload.getLevel());
		existing.setPrice(payload.getPrice());
		existing.setInstructorId(payload.getInstructorId());
		existing.setLessons(payload.getLessons());
		return courseRepository.save(existing);
	}

	public void deleteCourse(String id) {
		Course existing = getCourseById(id);
		courseRepository.delete(existing);
	}

	public Course addLesson(String courseId, Lesson lesson) {
		Course course = getCourseById(courseId);

		boolean duplicateTitle = course.getLessons().stream()
				.anyMatch(existingLesson -> existingLesson.getTitle() != null
						&& existingLesson.getTitle().equalsIgnoreCase(lesson.getTitle()));

		if (duplicateTitle) {
			throw new IllegalArgumentException("Lesson title already exists in this course: " + lesson.getTitle());
		}

		course.getLessons().add(lesson);
		return courseRepository.save(course);
	}

	public Course removeLesson(String courseId, int lessonIndex) {
		Course course = getCourseById(courseId);
		if (lessonIndex < 0 || lessonIndex >= course.getLessons().size()) {
			throw new IllegalArgumentException("Lesson index is out of range");
		}
		course.getLessons().remove(lessonIndex);
		return courseRepository.save(course);
	}
}

```

## backend/src/main/java/com/school/onlinelearning/service/DashboardService.java

```java
package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.dashboard.DashboardStatsResponse;
import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Enrollment;
import com.school.onlinelearning.repository.CourseRepository;
import com.school.onlinelearning.repository.EnrollmentRepository;
import com.school.onlinelearning.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

	private final StudentRepository studentRepository;
	private final CourseRepository courseRepository;
	private final EnrollmentRepository enrollmentRepository;

	public DashboardService(
			StudentRepository studentRepository,
			CourseRepository courseRepository,
			EnrollmentRepository enrollmentRepository
	) {
		this.studentRepository = studentRepository;
		this.courseRepository = courseRepository;
		this.enrollmentRepository = enrollmentRepository;
	}

	public DashboardStatsResponse getStats() {
		long totalStudents = studentRepository.count();
		long totalCourses = courseRepository.count();
		long totalEnrollments = enrollmentRepository.count();

		List<Enrollment> enrollments = enrollmentRepository.findAll();
		double averageProgress = enrollments.stream()
				.mapToDouble(Enrollment::getProgress)
				.average()
				.orElse(0.0);

		List<Course> courses = courseRepository.findAll();
		Course courseWithMostLessons = null;
		for (Course course : courses) {
			if (courseWithMostLessons == null || course.getLessons().size() > courseWithMostLessons.getLessons().size()) {
				courseWithMostLessons = course;
			}
		}

		String topTitle = courseWithMostLessons != null ? courseWithMostLessons.getTitle() : "N/A";
		int topCount = courseWithMostLessons != null ? courseWithMostLessons.getLessons().size() : 0;

		return new DashboardStatsResponse(
				totalStudents,
				totalCourses,
				totalEnrollments,
				Math.round(averageProgress * 100.0) / 100.0,
				topTitle,
				topCount
		);
	}
}

```

## backend/src/main/java/com/school/onlinelearning/service/EnrollmentService.java

```java
package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.enrollment.EnrollmentResponse;
import com.school.onlinelearning.exception.DuplicateResourceException;
import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Course;
import com.school.onlinelearning.model.Enrollment;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.model.UserRole;
import com.school.onlinelearning.repository.CourseRepository;
import com.school.onlinelearning.repository.EnrollmentRepository;
import com.school.onlinelearning.repository.StudentRepository;
import com.school.onlinelearning.security.AuthenticatedUser;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

	private final EnrollmentRepository enrollmentRepository;
	private final StudentRepository studentRepository;
	private final CourseRepository courseRepository;

	public EnrollmentService(
			EnrollmentRepository enrollmentRepository,
			StudentRepository studentRepository,
			CourseRepository courseRepository
	) {
		this.enrollmentRepository = enrollmentRepository;
		this.studentRepository = studentRepository;
		this.courseRepository = courseRepository;
	}

	public List<EnrollmentResponse> getAllEnrollments(AuthenticatedUser currentUser, String sort) {
		if (currentUser.getRole() == UserRole.STUDENT) {
			Student student = studentRepository.findByUserId(currentUser.getId())
					.orElseThrow(() -> new ResourceNotFoundException("Student profile not found for current user"));
			return mapToResponses(getSortedStudentEnrollments(student.getId(), sort));
		}

		return mapToResponses(getSortedAllEnrollments(sort));
	}

	public EnrollmentResponse getEnrollmentById(String id, AuthenticatedUser currentUser) {
		Enrollment enrollment = enrollmentRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: " + id));

		if (currentUser.getRole() == UserRole.STUDENT) {
			Student student = studentRepository.findByUserId(currentUser.getId())
					.orElseThrow(() -> new ResourceNotFoundException("Student profile not found for current user"));
			if (!enrollment.getStudentId().equals(student.getId())) {
				throw new IllegalArgumentException("You can only view your own enrollments");
			}
		}

		return mapToResponses(List.of(enrollment)).get(0);
	}

	public EnrollmentResponse createEnrollment(Enrollment enrollment) {
		if (!studentRepository.existsById(enrollment.getStudentId())) {
			throw new ResourceNotFoundException("Student not found: " + enrollment.getStudentId());
		}

		if (!courseRepository.existsById(enrollment.getCourseId())) {
			throw new ResourceNotFoundException("Course not found: " + enrollment.getCourseId());
		}

		if (enrollmentRepository.existsByStudentIdAndCourseId(enrollment.getStudentId(), enrollment.getCourseId())) {
			throw new DuplicateResourceException("Student is already enrolled in this course");
		}

		if (enrollment.getProgress() < 0 || enrollment.getProgress() > 100) {
			throw new IllegalArgumentException("Progress must be between 0 and 100");
		}

		enrollment.setProgress(enrollment.getProgress());
		enrollment.setEnrolledAt(LocalDateTime.now());

		Enrollment saved = enrollmentRepository.save(enrollment);
		return mapToResponses(List.of(saved)).get(0);
	}

	public EnrollmentResponse updateProgress(String enrollmentId, double progress) {
		if (progress < 0 || progress > 100) {
			throw new IllegalArgumentException("Progress must be between 0 and 100");
		}

		Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
				.orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: " + enrollmentId));

		enrollment.setProgress(progress);
		Enrollment saved = enrollmentRepository.save(enrollment);
		return mapToResponses(List.of(saved)).get(0);
	}

	public void deleteEnrollment(String id) {
		Enrollment enrollment = enrollmentRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: " + id));
		enrollmentRepository.delete(enrollment);
	}

	private List<Enrollment> getSortedAllEnrollments(String sort) {
		if ("progress".equalsIgnoreCase(sort)) {
			return enrollmentRepository.findAllByOrderByProgressDesc();
		}
		if ("date".equalsIgnoreCase(sort)) {
			return enrollmentRepository.findAllByOrderByEnrolledAtDesc();
		}
		return enrollmentRepository.findAll();
	}

	private List<Enrollment> getSortedStudentEnrollments(String studentId, String sort) {
		if ("progress".equalsIgnoreCase(sort)) {
			return enrollmentRepository.findByStudentIdOrderByProgressDesc(studentId);
		}
		if ("date".equalsIgnoreCase(sort)) {
			return enrollmentRepository.findByStudentIdOrderByEnrolledAtDesc(studentId);
		}
		return enrollmentRepository.findByStudentId(studentId);
	}

	private List<EnrollmentResponse> mapToResponses(List<Enrollment> enrollments) {
		Map<String, Student> studentMap = studentRepository.findAllById(
				enrollments.stream().map(Enrollment::getStudentId).collect(Collectors.toSet())
		).stream().collect(Collectors.toMap(Student::getId, Function.identity()));

		Map<String, Course> courseMap = courseRepository.findAllById(
				enrollments.stream().map(Enrollment::getCourseId).collect(Collectors.toSet())
		).stream().collect(Collectors.toMap(Course::getId, Function.identity()));

		return enrollments.stream().map(enrollment -> {
			Student student = studentMap.get(enrollment.getStudentId());
			Course course = courseMap.get(enrollment.getCourseId());

			return new EnrollmentResponse(
					enrollment.getId(),
					enrollment.getStudentId(),
					student != null ? student.getFullName() : "Unknown Student",
					enrollment.getCourseId(),
					course != null ? course.getTitle() : "Unknown Course",
					enrollment.getProgress(),
					enrollment.getEnrolledAt()
			);
		}).toList();
	}
}

```

## backend/src/main/java/com/school/onlinelearning/service/InstructorService.java

```java
package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.DuplicateResourceException;
import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Instructor;
import com.school.onlinelearning.repository.InstructorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstructorService {

	private final InstructorRepository instructorRepository;

	public InstructorService(InstructorRepository instructorRepository) {
		this.instructorRepository = instructorRepository;
	}

	public List<Instructor> getAllInstructors() {
		return instructorRepository.findAll();
	}

	public Instructor getInstructorById(String id) {
		return instructorRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Instructor not found: " + id));
	}

	public Instructor createInstructor(Instructor instructor) {
		if (instructorRepository.existsByEmail(instructor.getEmail())) {
			throw new DuplicateResourceException("Instructor email already exists: " + instructor.getEmail());
		}
		return instructorRepository.save(instructor);
	}

	public Instructor updateInstructor(String id, Instructor payload) {
		Instructor existing = getInstructorById(id);
		if (!existing.getEmail().equalsIgnoreCase(payload.getEmail()) && instructorRepository.existsByEmail(payload.getEmail())) {
			throw new DuplicateResourceException("Instructor email already exists: " + payload.getEmail());
		}

		existing.setUserId(payload.getUserId());
		existing.setFullName(payload.getFullName());
		existing.setEmail(payload.getEmail());
		existing.setSpecialization(payload.getSpecialization());
		return instructorRepository.save(existing);
	}

	public void deleteInstructor(String id) {
		Instructor existing = getInstructorById(id);
		instructorRepository.delete(existing);
	}
}

```

## backend/src/main/java/com/school/onlinelearning/service/StudentService.java

```java
package com.school.onlinelearning.service;

import com.school.onlinelearning.exception.DuplicateResourceException;
import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

	private final StudentRepository studentRepository;

	public StudentService(StudentRepository studentRepository) {
		this.studentRepository = studentRepository;
	}

	public List<Student> getAllStudents(String search) {
		if (search != null && !search.isBlank()) {
			return studentRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search);
		}
		return studentRepository.findAll();
	}

	public Student getStudentById(String id) {
		return studentRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
	}

	public Student createStudent(Student student) {
		if (studentRepository.existsByEmail(student.getEmail())) {
			throw new DuplicateResourceException("Student email already exists: " + student.getEmail());
		}
		return studentRepository.save(student);
	}

	public Student updateStudent(String id, Student payload) {
		Student existing = getStudentById(id);

		if (!existing.getEmail().equalsIgnoreCase(payload.getEmail())
				&& studentRepository.existsByEmail(payload.getEmail())) {
			throw new DuplicateResourceException("Student email already exists: " + payload.getEmail());
		}

		existing.setUserId(payload.getUserId());
		existing.setFullName(payload.getFullName());
		existing.setEmail(payload.getEmail());
		existing.setBatch(payload.getBatch());
		return studentRepository.save(existing);
	}

	public void deleteStudent(String id) {
		Student existing = getStudentById(id);
		studentRepository.delete(existing);
	}
}

```

## backend/src/main/resources/application.properties

```properties
spring.application.name=onlinelearning
spring.data.mongodb.uri=${MONGODB_URI:mongodb+srv://bolro:4848@onlinelearning.ywapodi.mongodb.net/onlinelearning?retryWrites=true&w=majority&appName=onlinelearning}
server.port=${PORT:8080}
jwt.secret=${JWT_SECRET:MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=}
jwt.expiration-ms=${JWT_EXPIRATION_MS:86400000}
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000}
```

