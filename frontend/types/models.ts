/**
 * Frontend type hierarchy mirroring the backend OOP model.
 *
 * OOP Pillars demonstrated (in TypeScript):
 *   - ABSTRACTION   : IPerson defines the shared contract without exposing
 *                     implementation details
 *   - INHERITANCE   : IStudent and IInstructor extend IPerson — they inherit
 *                     id, userId, fullName, email and add their own fields
 *   - ENCAPSULATION : types enforce read-only shapes; callers cannot mutate
 *                     fields directly — they must go through API calls
 *   - POLYMORPHISM  : anywhere IPerson is accepted, an IStudent or IInstructor
 *                     can be passed; functions can operate on the common fields
 *                     without knowing the concrete subtype
 */

// ─── Base interface (mirrors Person.java abstract class) ──────────────────────

/**
 * Represents any person in the system.
 * Mirrors the abstract Person base class in the Java backend.
 */
export interface IPerson {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  /** Returns a human-readable description — same contract as Person.describe() */
  describe(): string;
}

// ─── Sub-interfaces (mirrors Student.java and Instructor.java) ────────────────

/**
 * Represents a student.
 * Extends IPerson (inheritance) — adds the batch-specific field.
 */
export interface IStudent extends IPerson {
  batch: string;
}

/**
 * Represents an instructor.
 * Extends IPerson (inheritance) — adds the specialization-specific field.
 */
export interface IInstructor extends IPerson {
  specialization: string;
}

// ─── Concrete classes implementing the interfaces ─────────────────────────────

/**
 * Concrete Student class.
 * Implements IStudent — demonstrates polymorphism through describe().
 */
export class StudentModel implements IStudent {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  batch: string;

  constructor(id: string, fullName: string, email: string, batch: string, userId?: string) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.batch = batch;
    this.userId = userId;
  }

  /**
   * Student-specific description (POLYMORPHISM).
   * Same method name as InstructorModel.describe(), different output.
   */
  describe(): string {
    return `Student [${this.fullName}] from batch ${this.batch} | email: ${this.email}`;
  }
}

/**
 * Concrete Instructor class.
 * Implements IInstructor — demonstrates polymorphism through describe().
 */
export class InstructorModel implements IInstructor {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  specialization: string;

  constructor(id: string, fullName: string, email: string, specialization: string, userId?: string) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.specialization = specialization;
    this.userId = userId;
  }

  /**
   * Instructor-specific description (POLYMORPHISM).
   * Same method name as StudentModel.describe(), different output.
   */
  describe(): string {
    return `Instructor [${this.fullName}] specializing in ${this.specialization} | email: ${this.email}`;
  }
}

// ─── Polymorphic utility function ─────────────────────────────────────────────

/**
 * Accepts ANY IPerson (student or instructor) and returns their description.
 * This is POLYMORPHISM in action — the caller does not need to know the
 * concrete type; the correct describe() is called automatically.
 *
 * @example
 * const s = new StudentModel(...);
 * const i = new InstructorModel(...);
 * describePerson(s); // "Student [Ahmed] from batch 2024..."
 * describePerson(i); // "Instructor [Sara] specializing in..."
 */
export function describePerson(person: IPerson): string {
  return person.describe();
}
