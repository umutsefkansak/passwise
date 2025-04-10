package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.AlertType;
import com.umut.passwise.repository.AlertTypeRepository;
import com.umut.passwise.service.abstracts.IAlertTypeService;

import java.util.List;
import java.util.Optional;

@Service
public class AlertTypeServiceImpl implements IAlertTypeService {

    private final AlertTypeRepository alertTypeRepository;

    @Autowired
    public AlertTypeServiceImpl(AlertTypeRepository alertTypeRepository) {
        this.alertTypeRepository = alertTypeRepository;
    }

    @Override
    public List<AlertType> findAll() {
        return alertTypeRepository.findAll();
    }

    @Override
    public Optional<AlertType> findById(Long id) {
        return alertTypeRepository.findById(id);
    }

    @Override
    public AlertType save(AlertType alertType) {
        return alertTypeRepository.save(alertType);
    }

    @Override
    public void deleteById(Long id) {
        alertTypeRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return alertTypeRepository.existsById(id);
    }
}
