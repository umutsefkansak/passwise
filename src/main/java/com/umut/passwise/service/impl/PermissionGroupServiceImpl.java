package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.PermissionGroup;
import com.umut.passwise.repository.PermissionGroupRepository;
import com.umut.passwise.service.abstracts.IPermissionGroupService;

import java.util.List;
import java.util.Optional;

@Service
public class PermissionGroupServiceImpl implements IPermissionGroupService {

    private final PermissionGroupRepository permissionGroupRepository;

    @Autowired
    public PermissionGroupServiceImpl(PermissionGroupRepository permissionGroupRepository) {
        this.permissionGroupRepository = permissionGroupRepository;
    }

    @Override
    public List<PermissionGroup> findAll() {
        return permissionGroupRepository.findAll();
    }

    @Override
    public Optional<PermissionGroup> findById(Long id) {
        return permissionGroupRepository.findById(id);
    }

    @Override
    public PermissionGroup save(PermissionGroup permissionGroup) {
        return permissionGroupRepository.save(permissionGroup);
    }

    @Override
    public void deleteById(Long id) {
        permissionGroupRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return permissionGroupRepository.existsById(id);
    }
}
