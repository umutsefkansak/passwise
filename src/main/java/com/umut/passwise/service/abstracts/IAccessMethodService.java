package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.AccessMethod;

public interface IAccessMethodService {

    List<AccessMethod> findAll();

    Optional<AccessMethod> findById(Long id);

    AccessMethod save(AccessMethod accessMethod);

    void deleteById(Long id);

    boolean existsById(Long id);
}
