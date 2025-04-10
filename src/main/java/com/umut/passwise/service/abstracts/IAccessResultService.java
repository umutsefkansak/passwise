package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.AccessResult;

public interface IAccessResultService {

    List<AccessResult> findAll();

    Optional<AccessResult> findById(Long id);

    AccessResult save(AccessResult accessResult);

    void deleteById(Long id);

    boolean existsById(Long id);
}
