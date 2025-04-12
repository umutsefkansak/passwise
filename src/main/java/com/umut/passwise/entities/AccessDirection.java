//KAPILARIN GİRİŞ Mİ ÇIKIŞ MI OLDUĞUNU BELİRTMEK İÇİN
package com.umut.passwise.entities;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "access_directions")
public class AccessDirection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true)
    private String name;

    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "accessDirection")
    private List<Door> doors;


    // Getters and Setters
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

}