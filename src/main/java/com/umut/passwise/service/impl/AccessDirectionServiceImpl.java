package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.AccessDirection;
import com.umut.passwise.repository.AccessDirectionRepository;
import com.umut.passwise.service.abstracts.IAccessDirectionService;

import java.util.List;
import java.util.Optional;

@Service
public class AccessDirectionServiceImpl implements IAccessDirectionService {

    private final AccessDirectionRepository accessDirectionRepository;

    @Autowired
    public AccessDirectionServiceImpl(AccessDirectionRepository accessDirectionRepository) {
        this.accessDirectionRepository = accessDirectionRepository;
    }

    @Override
    public List<AccessDirection> findAll() {
        return accessDirectionRepository.findAll();
    }

    @Override
    public Optional<AccessDirection> findById(Long id) {
        return accessDirectionRepository.findById(id);
    }

    @Override
    public AccessDirection save(AccessDirection accessDirection) {
        return accessDirectionRepository.save(accessDirection);
    }

    @Override
    public void deleteById(Long id) {
        accessDirectionRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return accessDirectionRepository.existsById(id);
    }
}
