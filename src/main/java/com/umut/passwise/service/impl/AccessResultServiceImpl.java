package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.AccessResult;
import com.umut.passwise.repository.AccessResultRepository;
import com.umut.passwise.service.abstracts.IAccessResultService;

import java.util.List;
import java.util.Optional;

@Service
public class AccessResultServiceImpl implements IAccessResultService {

    private final AccessResultRepository accessResultRepository;

    @Autowired
    public AccessResultServiceImpl(AccessResultRepository accessResultRepository) {
        this.accessResultRepository = accessResultRepository;
    }

    @Override
    public List<AccessResult> findAll() {
        return accessResultRepository.findAll();
    }

    @Override
    public Optional<AccessResult> findById(Long id) {
        return accessResultRepository.findById(id);
    }

    @Override
    public AccessResult save(AccessResult accessResult) {
        return accessResultRepository.save(accessResult);
    }

    @Override
    public void deleteById(Long id) {
        accessResultRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return accessResultRepository.existsById(id);
    }
}
