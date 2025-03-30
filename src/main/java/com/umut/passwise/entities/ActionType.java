// Yetki verme (GRANT) veya yetki alma (REVOKE) gibi işlem tiplerini belirtmek için
package com.umut.passwise.entities;

import jakarta.persistence.*;

// ActionType Entity
@Entity
@Table(name = "action_types")
public class ActionType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

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


