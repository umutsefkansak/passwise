package com.umut.passwise.controller;

import com.umut.passwise.entities.BlacklistReason;
import com.umut.passwise.service.impl.BlacklistReasonService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;



@RestController
@RequestMapping("/api/reasons")
public class BlacklistReasonController {


    @Autowired
    private BlacklistReasonService service;

    @GetMapping("/all")
    public List<BlacklistReason> getAll(){
        return service.getAll();
    }
}
