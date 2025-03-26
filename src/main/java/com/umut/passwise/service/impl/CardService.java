package com.umut.passwise.service.impl;

import com.umut.passwise.entities.Card;
import com.umut.passwise.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CardService {

    @Autowired
    private CardRepository repository;

    public List<Card> getAll(){
        return repository.findAll();
    }


}
