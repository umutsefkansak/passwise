package com.umut.passwise.service.impl;


import com.umut.passwise.entities.CardBlacklist;
import com.umut.passwise.repository.CardBlacklistRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CardBlacklistService {

    @Autowired
    private CardBlacklistRepository repository;

    public List<CardBlacklist> getAll(){
        return repository.findAll();
    }
}
