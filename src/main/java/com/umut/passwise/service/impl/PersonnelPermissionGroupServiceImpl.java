package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.PersonnelPermissionGroup;
import com.umut.passwise.repository.PersonnelPermissionGroupRepository;
import com.umut.passwise.service.abstracts.IPersonnelPermissionGroupService;

import java.util.List;
import java.util.Optional;

@Service
public class PersonnelPermissionGroupServiceImpl implements IPersonnelPermissionGroupService {

    private final PersonnelPermissionGroupRepository personnelPermissionGroupRepository;

    @Autowired
    public PersonnelPermissionGroupServiceImpl(PersonnelPermissionGroupRepository personnelPermissionGroupRepository) {
        this.personnelPermissionGroupRepository = personnelPermissionGroupRepository;
    }

    @Override
    public List<PersonnelPermissionGroup> findAll() {
        return personnelPermissionGroupRepository.findAll();
    }

    @Override
    public Optional<PersonnelPermissionGroup> findById(Long id) {
        return personnelPermissionGroupRepository.findById(id);
    }

    @Override
    public PersonnelPermissionGroup save(PersonnelPermissionGroup personnelPermissionGroup) {
        return personnelPermissionGroupRepository.save(personnelPermissionGroup);
    }

    @Override
    public void deleteById(Long id) {
        personnelPermissionGroupRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personnelPermissionGroupRepository.existsById(id);
    }
}
