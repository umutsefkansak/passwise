package com.umut.passwise.controller;


import com.umut.passwise.entities.Blacklist;
import com.umut.passwise.service.impl.BlacklistService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/blacklist")
@AllArgsConstructor
public class BlacklistController {

    @Autowired
    private BlacklistService service;

    @GetMapping("/getall")
    public List<Blacklist> getAll(){
        return service.getAll();
    }

}
