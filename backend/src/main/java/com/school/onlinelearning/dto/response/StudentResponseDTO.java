package com.school.onlinelearning.dto.response;

import com.school.onlinelearning.model.Student;

public record StudentResponseDTO(
        String id,
        String userId,
        String fullName,
        String email,
        String batch,
        int xp
) {
    public static StudentResponseDTO fromEntity(Student entity) {
        return new StudentResponseDTO(
            entity.getId(),
            entity.getUserId(),
            entity.getFullName(),
            entity.getEmail(),
            entity.getBatch(),
            entity.getXp()
        );
    }
}
