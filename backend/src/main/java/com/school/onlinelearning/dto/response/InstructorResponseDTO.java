package com.school.onlinelearning.dto.response;

import com.school.onlinelearning.model.Instructor;

public record InstructorResponseDTO(
        String id,
        String userId,
        String fullName,
        String email,
        String specialization
) {
    public static InstructorResponseDTO fromEntity(Instructor entity) {
        return new InstructorResponseDTO(
            entity.getId(),
            entity.getUserId(),
            entity.getFullName(),
            entity.getEmail(),
            entity.getSpecialization()
        );
    }
}
