package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.Personnel;
import com.umut.passwise.repository.PersonnelRepository;
import com.umut.passwise.service.abstracts.IPersonnelService;

import java.util.List;
import java.util.Optional;

@Service
public class PersonnelServiceImpl implements IPersonnelService {

    private final PersonnelRepository personnelRepository;

    @Autowired
    public PersonnelServiceImpl(PersonnelRepository personnelRepository) {
        this.personnelRepository = personnelRepository;
    }

    @Override
    public List<Personnel> findAll() {
        return personnelRepository.findAll();
    }

    @Override
    public Optional<Personnel> findById(Long id) {
        return personnelRepository.findById(id);
    }

    @Override
    public Personnel save(Personnel personnel) {
        return personnelRepository.save(personnel);
    }

    @Override
    public void deleteById(Long id) {
        personnelRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personnelRepository.existsById(id);
    }
}
