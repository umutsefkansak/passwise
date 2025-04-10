package com.umut.passwise.controller;


import com.umut.passwise.entities.Door;
import com.umut.passwise.service.impl.DoorServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/door")
public class DoorController {


    @Autowired
    private DoorServiceImpl service;

    @GetMapping("/all")
    public List<Door> getAll(){
        return service.findAll();
    }
}
