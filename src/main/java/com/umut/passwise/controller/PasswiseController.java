package com.umut.passwise.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PasswiseController {

    @GetMapping("/hello")
    public String hello(){
        return "Hello Passwise";
    }
}
