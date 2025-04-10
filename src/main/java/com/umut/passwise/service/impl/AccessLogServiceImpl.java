package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.AccessLog;
import com.umut.passwise.repository.AccessLogRepository;
import com.umut.passwise.service.abstracts.IAccessLogService;

import java.util.List;
import java.util.Optional;

@Service
public class AccessLogServiceImpl implements IAccessLogService {

    private final AccessLogRepository accessLogRepository;

    @Autowired
    public AccessLogServiceImpl(AccessLogRepository accessLogRepository) {
        this.accessLogRepository = accessLogRepository;
    }

    @Override
    public List<AccessLog> findAll() {
        return accessLogRepository.findAll();
    }

    @Override
    public Optional<AccessLog> findById(Long id) {
        return accessLogRepository.findById(id);
    }

    @Override
    public AccessLog save(AccessLog accessLog) {
        return accessLogRepository.save(accessLog);
    }

    @Override
    public void deleteById(Long id) {
        accessLogRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return accessLogRepository.existsById(id);
    }
}
