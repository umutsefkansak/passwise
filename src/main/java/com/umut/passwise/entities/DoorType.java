package com.umut.passwise.entities;


import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "doortypes")
public class DoorType {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,unique = true)
    private String name;


    @OneToMany(mappedBy = "doorType")
    private List<Door> doors;

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
