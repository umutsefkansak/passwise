package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.ActionType;
import com.umut.passwise.repository.ActionTypeRepository;
import com.umut.passwise.service.abstracts.IActionTypeService;

import java.util.List;
import java.util.Optional;

@Service
public class ActionTypeServiceImpl implements IActionTypeService {

    private final ActionTypeRepository actionTypeRepository;

    @Autowired
    public ActionTypeServiceImpl(ActionTypeRepository actionTypeRepository) {
        this.actionTypeRepository = actionTypeRepository;
    }

    @Override
    public List<ActionType> findAll() {
        return actionTypeRepository.findAll();
    }

    @Override
    public Optional<ActionType> findById(Long id) {
        return actionTypeRepository.findById(id);
    }

    @Override
    public ActionType save(ActionType actionType) {
        return actionTypeRepository.save(actionType);
    }

    @Override
    public void deleteById(Long id) {
        actionTypeRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return actionTypeRepository.existsById(id);
    }
}
