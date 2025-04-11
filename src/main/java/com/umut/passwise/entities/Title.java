package com.umut.passwise.entities;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "titles")
public class Title {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true,nullable = false)
    private String name;

    @OneToMany(mappedBy = "title")
    private List<Personnel> personnels;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
