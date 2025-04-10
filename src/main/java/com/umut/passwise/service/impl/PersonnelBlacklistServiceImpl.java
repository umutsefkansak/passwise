package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.PersonnelBlacklist;
import com.umut.passwise.repository.PersonnelBlacklistRepository;
import com.umut.passwise.service.abstracts.IPersonnelBlacklistService;

import java.util.List;
import java.util.Optional;

@Service
public class PersonnelBlacklistServiceImpl implements IPersonnelBlacklistService {

    private final PersonnelBlacklistRepository personnelBlacklistRepository;

    @Autowired
    public PersonnelBlacklistServiceImpl(PersonnelBlacklistRepository personnelBlacklistRepository) {
        this.personnelBlacklistRepository = personnelBlacklistRepository;
    }

    @Override
    public List<PersonnelBlacklist> findAll() {
        return personnelBlacklistRepository.findAll();
    }

    @Override
    public Optional<PersonnelBlacklist> findById(Long id) {
        return personnelBlacklistRepository.findById(id);
    }

    @Override
    public PersonnelBlacklist save(PersonnelBlacklist personnelBlacklist) {
        return personnelBlacklistRepository.save(personnelBlacklist);
    }

    @Override
    public void deleteById(Long id) {
        personnelBlacklistRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personnelBlacklistRepository.existsById(id);
    }
}
