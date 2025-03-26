package com.umut.passwise.service.impl;

import com.umut.passwise.entities.Blacklist;
import com.umut.passwise.repository.BlacklistRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class BlacklistService {


    @Autowired
    private BlacklistRepository repository;

    public List<Blacklist> getAll(){
        return repository.findAll();
    }


}
