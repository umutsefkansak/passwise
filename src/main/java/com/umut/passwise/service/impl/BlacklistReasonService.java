package com.umut.passwise.service.impl;

import com.umut.passwise.entities.BlacklistReason;
import com.umut.passwise.repository.BlacklistReasonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BlacklistReasonService {

    private BlacklistReasonRepository repository;

    public BlacklistReasonService(BlacklistReasonRepository repository) {
        this.repository = repository;
    }


    public List<BlacklistReason> getAll(){
        return repository.findAll();
    }

}
