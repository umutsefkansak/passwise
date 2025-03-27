package com.umut.passwise.controller;

import com.umut.passwise.entities.CardBlacklistReason;
import com.umut.passwise.service.impl.CardBlacklistReasonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;



@RestController
@RequestMapping("/api/reasons")
public class BlacklistReasonController {


    @Autowired
    private CardBlacklistReasonService service;

    @GetMapping("/all")
    public List<CardBlacklistReason> getAll(){
        return service.getAll();
    }
}
