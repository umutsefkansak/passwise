package com.umut.passwise.controller;


import com.umut.passwise.entities.DoorType;
import com.umut.passwise.service.impl.DoorTypeServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/doortype")

public class DoorTypeController {

    @Autowired
    private DoorTypeServiceImpl doorTypeService;

    @GetMapping("/all")
    public List<DoorType> findAll(){

        return doorTypeService.findAll();

    }
}
