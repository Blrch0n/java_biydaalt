package com.school.onlinelearning.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;

/**
 * Abstract base class that represents any person in the system.
 *
 * OOP Pillars demonstrated:
 *   - ENCAPSULATION : all fields are private/protected with public getters/setters
 *   - INHERITANCE   : Student and Instructor extend this class and inherit shared fields
 *   - ABSTRACTION   : declare the abstract describe() contract; subclasses must implement it
 *   - POLYMORPHISM  : describe() is overridden differently in each subclass
 */
public abstract class Person {

    @Id
    private String id;

    private String userId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    // ------------------------------------------------------------------ //
    //  Constructors
    // ------------------------------------------------------------------ //

    protected Person() {
    }

    protected Person(String id, String userId, String fullName, String email) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
    }

    // ------------------------------------------------------------------ //
    //  Abstract method — forces every subclass to describe itself
    //  (Abstraction + Polymorphism)
    // ------------------------------------------------------------------ //

    /**
     * Returns a human-readable description of this person.
     * Each subclass provides its own implementation (polymorphism).
     */
    public abstract String describe();

    // ------------------------------------------------------------------ //
    //  Getters & Setters  (Encapsulation)
    // ------------------------------------------------------------------ //

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

    @Override
    public String toString() {
        return "Person{id='" + id + "', fullName='" + fullName + "', email='" + email + "'}";
    }
}
