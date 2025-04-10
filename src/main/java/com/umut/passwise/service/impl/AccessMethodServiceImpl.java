package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.AccessMethod;
import com.umut.passwise.repository.AccessMethodRepository;
import com.umut.passwise.service.abstracts.IAccessMethodService;

import java.util.List;
import java.util.Optional;

@Service
public class AccessMethodServiceImpl implements IAccessMethodService {

    private final AccessMethodRepository accessMethodRepository;

    @Autowired
    public AccessMethodServiceImpl(AccessMethodRepository accessMethodRepository) {
        this.accessMethodRepository = accessMethodRepository;
    }

    @Override
    public List<AccessMethod> findAll() {
        return accessMethodRepository.findAll();
    }

    @Override
    public Optional<AccessMethod> findById(Long id) {
        return accessMethodRepository.findById(id);
    }

    @Override
    public AccessMethod save(AccessMethod accessMethod) {
        return accessMethodRepository.save(accessMethod);
    }

    @Override
    public void deleteById(Long id) {
        accessMethodRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return accessMethodRepository.existsById(id);
    }
}
