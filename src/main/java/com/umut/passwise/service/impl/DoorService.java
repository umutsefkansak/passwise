package com.umut.passwise.service.impl;


import com.umut.passwise.entities.Door;
import com.umut.passwise.repository.DoorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoorService {


    @Autowired
    private DoorRepository repository;


    public List<Door> getAll(){
        return repository.findAll();
    }
}
