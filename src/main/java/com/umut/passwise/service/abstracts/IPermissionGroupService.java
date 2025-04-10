package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.PermissionGroup;

public interface IPermissionGroupService {

    List<PermissionGroup> findAll();

    Optional<PermissionGroup> findById(Long id);

    PermissionGroup save(PermissionGroup permissionGroup);

    void deleteById(Long id);

    boolean existsById(Long id);
}
