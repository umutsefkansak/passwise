package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.PersonType;
import com.umut.passwise.repository.PersonTypeRepository;
import com.umut.passwise.service.abstracts.IPersonTypeService;

import java.util.List;
import java.util.Optional;

@Service
public class PersonTypeServiceImpl implements IPersonTypeService {

    private final PersonTypeRepository personTypeRepository;

    @Autowired
    public PersonTypeServiceImpl(PersonTypeRepository personTypeRepository) {
        this.personTypeRepository = personTypeRepository;
    }

    @Override
    public List<PersonType> findAll() {
        return personTypeRepository.findAll();
    }

    @Override
    public Optional<PersonType> findById(Long id) {
        return personTypeRepository.findById(id);
    }

    @Override
    public PersonType save(PersonType personType) {
        return personTypeRepository.save(personType);
    }

    @Override
    public void deleteById(Long id) {
        personTypeRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personTypeRepository.existsById(id);
    }
}
