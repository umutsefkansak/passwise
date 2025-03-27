package com.umut.passwise.service.impl;

import com.umut.passwise.entities.CardBlacklistReason;
import com.umut.passwise.repository.CardBlacklistReasonRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CardBlacklistReasonService {

    private CardBlacklistReasonRepository repository;

    public CardBlacklistReasonService(CardBlacklistReasonRepository repository) {
        this.repository = repository;
    }


    public List<CardBlacklistReason> getAll(){
        return repository.findAll();
    }

}
