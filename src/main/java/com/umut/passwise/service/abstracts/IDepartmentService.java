package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.Department;

public interface IDepartmentService {

    List<Department> findAll();

    Optional<Department> findById(Long id);

    Department save(Department department);

    void deleteById(Long id);

    boolean existsById(Long id);
}
