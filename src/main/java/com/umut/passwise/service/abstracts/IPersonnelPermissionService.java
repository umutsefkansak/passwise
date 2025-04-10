package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.PersonnelPermission;

public interface IPersonnelPermissionService {

    List<PersonnelPermission> findAll();

    Optional<PersonnelPermission> findById(Long id);

    PersonnelPermission save(PersonnelPermission personnelPermission);

    void deleteById(Long id);

    boolean existsById(Long id);
}
