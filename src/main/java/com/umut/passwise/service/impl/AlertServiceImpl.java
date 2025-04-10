package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.Alert;
import com.umut.passwise.repository.AlertRepository;
import com.umut.passwise.service.abstracts.IAlertService;

import java.util.List;
import java.util.Optional;

@Service
public class AlertServiceImpl implements IAlertService {

    private final AlertRepository alertRepository;

    @Autowired
    public AlertServiceImpl(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @Override
    public List<Alert> findAll() {
        return alertRepository.findAll();
    }

    @Override
    public Optional<Alert> findById(Long id) {
        return alertRepository.findById(id);
    }

    @Override
    public Alert save(Alert alert) {
        return alertRepository.save(alert);
    }

    @Override
    public void deleteById(Long id) {
        alertRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return alertRepository.existsById(id);
    }
}
