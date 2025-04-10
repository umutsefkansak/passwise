package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.Permission;

public interface IPermissionService {

    List<Permission> findAll();

    Optional<Permission> findById(Long id);

    Permission save(Permission permission);

    void deleteById(Long id);

    boolean existsById(Long id);
}
