package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.AccessDirection;

public interface IAccessDirectionService {

    List<AccessDirection> findAll();

    Optional<AccessDirection> findById(Long id);

    AccessDirection save(AccessDirection accessDirection);

    void deleteById(Long id);

    boolean existsById(Long id);
}
