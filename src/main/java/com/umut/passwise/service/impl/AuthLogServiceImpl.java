package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.AuthLog;
import com.umut.passwise.repository.AuthLogRepository;
import com.umut.passwise.service.abstracts.IAuthLogService;

import java.util.List;
import java.util.Optional;

@Service
public class AuthLogServiceImpl implements IAuthLogService {

    private final AuthLogRepository authLogRepository;

    @Autowired
    public AuthLogServiceImpl(AuthLogRepository authLogRepository) {
        this.authLogRepository = authLogRepository;
    }

    @Override
    public List<AuthLog> findAll() {
        return authLogRepository.findAll();
    }

    @Override
    public Optional<AuthLog> findById(Long id) {
        return authLogRepository.findById(id);
    }

    @Override
    public AuthLog save(AuthLog authLog) {
        return authLogRepository.save(authLog);
    }

    @Override
    public void deleteById(Long id) {
        authLogRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return authLogRepository.existsById(id);
    }
}
