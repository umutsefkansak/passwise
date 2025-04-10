package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.PersonnelPermission;
import com.umut.passwise.repository.PersonnelPermissionRepository;
import com.umut.passwise.service.abstracts.IPersonnelPermissionService;

import java.util.List;
import java.util.Optional;

@Service
public class PersonnelPermissionServiceImpl implements IPersonnelPermissionService {

    private final PersonnelPermissionRepository personnelPermissionRepository;

    @Autowired
    public PersonnelPermissionServiceImpl(PersonnelPermissionRepository personnelPermissionRepository) {
        this.personnelPermissionRepository = personnelPermissionRepository;
    }

    @Override
    public List<PersonnelPermission> findAll() {
        return personnelPermissionRepository.findAll();
    }

    @Override
    public Optional<PersonnelPermission> findById(Long id) {
        return personnelPermissionRepository.findById(id);
    }

    @Override
    public PersonnelPermission save(PersonnelPermission personnelPermission) {
        return personnelPermissionRepository.save(personnelPermission);
    }

    @Override
    public void deleteById(Long id) {
        personnelPermissionRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personnelPermissionRepository.existsById(id);
    }
}
