package com.umut.passwise.controller;

import com.umut.passwise.entities.Card;
import com.umut.passwise.service.impl.CardServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/card")
public class CardController {


    @Autowired
    private CardServiceImpl service;


    @GetMapping("/all")
    public List<Card> getAll(){
        return service.findAll();
    }

}
