package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.PersonnelPermissionGroup;

public interface IPersonnelPermissionGroupService {

    List<PersonnelPermissionGroup> findAll();

    Optional<PersonnelPermissionGroup> findById(Long id);

    PersonnelPermissionGroup save(PersonnelPermissionGroup personnelPermissionGroup);

    void deleteById(Long id);

    boolean existsById(Long id);
}
