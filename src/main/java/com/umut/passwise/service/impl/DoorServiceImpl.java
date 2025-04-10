package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.Door;
import com.umut.passwise.repository.DoorRepository;
import com.umut.passwise.service.abstracts.IDoorService;

import java.util.List;
import java.util.Optional;

@Service
public class DoorServiceImpl implements IDoorService {

    private final DoorRepository doorRepository;

    @Autowired
    public DoorServiceImpl(DoorRepository doorRepository) {
        this.doorRepository = doorRepository;
    }

    @Override
    public List<Door> findAll() {
        return doorRepository.findAll();
    }

    @Override
    public Optional<Door> findById(Long id) {
        return doorRepository.findById(id);
    }

    @Override
    public Door save(Door door) {
        return doorRepository.save(door);
    }

    @Override
    public void deleteById(Long id) {
        doorRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return doorRepository.existsById(id);
    }
}
