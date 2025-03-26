package com.umut.passwise.service.impl;

import com.umut.passwise.entities.DoorType;
import com.umut.passwise.repository.DoorTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoorTypeService {

    @Autowired
    private DoorTypeRepository repository;


    public List<DoorType> getAll(){
        return repository.findAll();
    }



}
