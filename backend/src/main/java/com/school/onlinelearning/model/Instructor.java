package com.school.onlinelearning.model;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents an instructor who teaches courses in the system.
 *
 * OOP Pillars demonstrated:
 *   - INHERITANCE   : extends Person, inheriting id, userId, fullName, email
 *   - ENCAPSULATION : specialization field is private with public getter/setter
 *   - POLYMORPHISM  : overrides the abstract describe() from Person with
 *                     instructor-specific content — same method name as Student
 *                     but completely different behaviour
 */
@Document(collection = "instructors")
public class Instructor extends Person implements Describable {

    @NotBlank(message = "Specialization is required")
    private String specialization;

    // ------------------------------------------------------------------ //
    //  Constructors
    // ------------------------------------------------------------------ //

    public Instructor() {
        super();
    }

    public Instructor(String id, String userId, String fullName, String email, String specialization) {
        super(id, userId, fullName, email);
        this.specialization = specialization;
    }

    // ------------------------------------------------------------------ //
    //  Polymorphism — overrides the abstract describe() from Person
    // ------------------------------------------------------------------ //

    /**
     * Returns an instructor-specific description.
     * Demonstrates POLYMORPHISM: the same describe() contract defined in
     * Person is fulfilled here with instructor-specific content — the
     * runtime type determines which describe() is called.
     */
    @Override
    public String describe() {
        return "Instructor [" + getFullName() + "] specializing in " + specialization
                + " | email: " + getEmail();
    }

    @Override
    public String toString() {
        return "Instructor{id='" + getId() + "', fullName='" + getFullName()
                + "', email='" + getEmail() + "', specialization='" + specialization + "'}";
    }

    // ------------------------------------------------------------------ //
    //  Getters & Setters  (Encapsulation)
    // ------------------------------------------------------------------ //

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }
}
