package com.school.onlinelearning.model;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a student enrolled in the system.
 *
 * OOP Pillars demonstrated:
 *   - INHERITANCE   : extends Person, inheriting id, userId, fullName, email
 *   - ENCAPSULATION : batch field is private with public getter/setter
 *   - POLYMORPHISM  : overrides the abstract describe() from Person with
 *                     student-specific content
 */
@Document(collection = "students")
public class Student extends Person implements Describable {

    @NotBlank(message = "Batch is required")
    private String batch;

    private int xp = 0; // Gamification points

    // ------------------------------------------------------------------ //
    //  Constructors
    // ------------------------------------------------------------------ //

    public Student() {
        super();
    }

    public Student(String id, String userId, String fullName, String email, String batch) {
        super(id, userId, fullName, email);
        this.batch = batch;
    }

    // ------------------------------------------------------------------ //
    //  Polymorphism — overrides the abstract describe() from Person
    // ------------------------------------------------------------------ //

    /**
     * Returns a student-specific description.
     * Demonstrates POLYMORPHISM: the same describe() contract defined in
     * Person is fulfilled here with student-specific content.
     */
    @Override
    public String describe() {
        return "Student [" + getFullName() + "] from batch " + batch
                + " | email: " + getEmail();
    }

    @Override
    public String toString() {
        return "Student{id='" + getId() + "', fullName='" + getFullName()
                + "', email='" + getEmail() + "', batch='" + batch + "'}";
    }

    // ------------------------------------------------------------------ //
    //  Getters & Setters  (Encapsulation)
    // ------------------------------------------------------------------ //

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }
}
