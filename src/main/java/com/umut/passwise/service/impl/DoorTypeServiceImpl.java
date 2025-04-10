package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.DoorType;
import com.umut.passwise.repository.DoorTypeRepository;
import com.umut.passwise.service.abstracts.IDoorTypeService;

import java.util.List;
import java.util.Optional;

@Service
public class DoorTypeServiceImpl implements IDoorTypeService {

    private final DoorTypeRepository doorTypeRepository;

    @Autowired
    public DoorTypeServiceImpl(DoorTypeRepository doorTypeRepository) {
        this.doorTypeRepository = doorTypeRepository;
    }

    @Override
    public List<DoorType> findAll() {
        return doorTypeRepository.findAll();
    }

    @Override
    public Optional<DoorType> findById(Long id) {
        return doorTypeRepository.findById(id);
    }

    @Override
    public DoorType save(DoorType doorType) {
        return doorTypeRepository.save(doorType);
    }

    @Override
    public void deleteById(Long id) {
        doorTypeRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return doorTypeRepository.existsById(id);
    }
}
