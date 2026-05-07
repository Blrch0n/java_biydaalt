package com.school.onlinelearning.model;

/**
 * Describable interface — defines the contract for any object that can
 * describe itself in a human-readable form.
 *
 * OOP Pillars demonstrated:
 *   - ABSTRACTION   : the interface hides the "how" and exposes only the "what"
 *   - POLYMORPHISM  : Student and Instructor implement this the same method name
 *                     but return different descriptions at runtime
 */
public interface Describable {

    /**
     * Returns a human-readable description of the implementing object.
     * The implementation varies depending on the actual type (polymorphism).
     *
     * @return description string
     */
    String describe();
}
