package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.request.StudentRequestDTO;
import com.school.onlinelearning.dto.response.PageResponseDTO;
import com.school.onlinelearning.dto.response.StudentResponseDTO;
import org.springframework.data.domain.Pageable;

public interface StudentService {
    PageResponseDTO<StudentResponseDTO> getAllStudents(String search, Pageable pageable);
    StudentResponseDTO getStudentById(String id);
    StudentResponseDTO createStudent(StudentRequestDTO dto);
    StudentResponseDTO updateStudent(String id, StudentRequestDTO payload);
    void deleteStudent(String id);
}
