package com.school.onlinelearning.service;

import com.school.onlinelearning.dto.request.InstructorRequestDTO;
import com.school.onlinelearning.dto.response.InstructorResponseDTO;
import com.school.onlinelearning.dto.response.PageResponseDTO;
import org.springframework.data.domain.Pageable;

public interface InstructorService {
    PageResponseDTO<InstructorResponseDTO> getAllInstructors(Pageable pageable);
    InstructorResponseDTO getInstructorById(String id);
    InstructorResponseDTO createInstructor(InstructorRequestDTO instructor);
    InstructorResponseDTO updateInstructor(String id, InstructorRequestDTO payload);
    void deleteInstructor(String id);
}
