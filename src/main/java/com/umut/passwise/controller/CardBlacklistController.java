package com.umut.passwise.controller;

import com.umut.passwise.entities.CardBlacklist;
import com.umut.passwise.service.impl.CardBlacklistServiceImpl;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/blacklist")
@AllArgsConstructor
public class CardBlacklistController {

    @Autowired
    private CardBlacklistServiceImpl service;

    @GetMapping("/all")
    public List<CardBlacklist> getAll(){
        return service.findAll();
    }

}
