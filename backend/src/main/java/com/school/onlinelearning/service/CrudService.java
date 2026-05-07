package com.school.onlinelearning.service;

import java.util.List;

/**
 * Generic CRUD service interface.
 *
 * OOP Pillars demonstrated:
 *   - ABSTRACTION   : defines the operations a CRUD service must expose,
 *                     without specifying HOW they are carried out
 *   - POLYMORPHISM  : StudentServiceImpl, InstructorServiceImpl, and
 *                     CourseServiceImpl all satisfy this contract but
 *                     execute the operations differently
 *
 * @param <T> the entity type managed by the service
 */
public interface CrudService<T> {

    /** Returns all entities, optionally filtered by the given query string. */
    List<T> getAll(String query);

    /** Returns the entity with the given id, or throws ResourceNotFoundException. */
    T getById(String id);

    /** Persists a new entity and returns the saved copy. */
    T create(T entity);

    /** Updates an existing entity identified by id and returns the updated copy. */
    T update(String id, T payload);

    /** Deletes the entity with the given id. */
    void delete(String id);
}
