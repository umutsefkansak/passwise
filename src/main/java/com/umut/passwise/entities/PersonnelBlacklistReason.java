package com.umut.passwise.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "personnel_blacklist_reasons")
public class PersonnelBlacklistReason {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,unique = true)
    private String reason;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

}
