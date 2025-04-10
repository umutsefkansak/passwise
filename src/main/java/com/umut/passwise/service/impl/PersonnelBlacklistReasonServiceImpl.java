package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.PersonnelBlacklistReason;
import com.umut.passwise.repository.PersonnelBlacklistReasonRepository;
import com.umut.passwise.service.abstracts.IPersonnelBlacklistReasonService;

import java.util.List;
import java.util.Optional;

@Service
public class PersonnelBlacklistReasonServiceImpl implements IPersonnelBlacklistReasonService {

    private final PersonnelBlacklistReasonRepository personnelBlacklistReasonRepository;

    @Autowired
    public PersonnelBlacklistReasonServiceImpl(PersonnelBlacklistReasonRepository personnelBlacklistReasonRepository) {
        this.personnelBlacklistReasonRepository = personnelBlacklistReasonRepository;
    }

    @Override
    public List<PersonnelBlacklistReason> findAll() {
        return personnelBlacklistReasonRepository.findAll();
    }

    @Override
    public Optional<PersonnelBlacklistReason> findById(Long id) {
        return personnelBlacklistReasonRepository.findById(id);
    }

    @Override
    public PersonnelBlacklistReason save(PersonnelBlacklistReason personnelBlacklistReason) {
        return personnelBlacklistReasonRepository.save(personnelBlacklistReason);
    }

    @Override
    public void deleteById(Long id) {
        personnelBlacklistReasonRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personnelBlacklistReasonRepository.existsById(id);
    }
}
