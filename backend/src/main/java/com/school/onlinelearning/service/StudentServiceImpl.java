package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.request.StudentRequestDTO;
import com.school.onlinelearning.dto.response.PageResponseDTO;
import com.school.onlinelearning.dto.response.StudentResponseDTO;
import com.school.onlinelearning.exception.DuplicateResourceException;
import com.school.onlinelearning.exception.ResourceNotFoundException;
import com.school.onlinelearning.model.Student;
import com.school.onlinelearning.repository.EnrollmentRepository;
import com.school.onlinelearning.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;

    public StudentServiceImpl(StudentRepository studentRepository, EnrollmentRepository enrollmentRepository) {
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Override
    public PageResponseDTO<StudentResponseDTO> getAllStudents(String search, Pageable pageable) {
        Page<Student> page;
        if (search != null && !search.isBlank()) {
            page = studentRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        } else {
            page = studentRepository.findAll(pageable);
        }
        Page<StudentResponseDTO> dtoPage = page.map(StudentResponseDTO::fromEntity);
        return PageResponseDTO.of(dtoPage);
    }

    @Override
    public StudentResponseDTO getStudentById(String id) {
        return StudentResponseDTO.fromEntity(getStudentEntityById(id));
    }

    @Override
    public StudentResponseDTO createStudent(StudentRequestDTO dto) {
        if (studentRepository.existsByEmail(dto.email())) {
            throw new DuplicateResourceException("Student email already exists: " + dto.email());
        }
        Student student = new Student();
        student.setFullName(dto.fullName());
        student.setEmail(dto.email());
        student.setBatch(dto.batch());
        
        return StudentResponseDTO.fromEntity(studentRepository.save(student));
    }

    @Override
    public StudentResponseDTO updateStudent(String id, StudentRequestDTO payload) {
        Student existing = getStudentEntityById(id);

        if (!existing.getEmail().equalsIgnoreCase(payload.email())
                && studentRepository.existsByEmail(payload.email())) {
            throw new DuplicateResourceException("Student email already exists: " + payload.email());
        }

        existing.setFullName(payload.fullName());
        existing.setEmail(payload.email());
        existing.setBatch(payload.batch());
        
        return StudentResponseDTO.fromEntity(studentRepository.save(existing));
    }

    @Override
    public void deleteStudent(String id) {
        Student existing = getStudentEntityById(id);
        enrollmentRepository.deleteAll(enrollmentRepository.findByStudentId(id));
        studentRepository.delete(existing);
    }

    private Student getStudentEntityById(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
    }
}
