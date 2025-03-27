package com.umut.passwise.entities;


import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "personnel_blacklist")
public class PersonnelBlacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "personnel_id",referencedColumnName = "id")
    private Personnel personnel;


    @ManyToOne
    @JoinColumn(name = "reason_id",referencedColumnName = "id")
    private PersonnelBlacklistReason reason;


    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp dateAdded;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }



    public Timestamp getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(Timestamp dateAdded) {
        this.dateAdded = dateAdded;
    }

    public Personnel getPersonnel() {
        return personnel;
    }

    public void setPersonnel(Personnel personnel) {
        this.personnel = personnel;
    }

    public PersonnelBlacklistReason getReason() {
        return reason;
    }

    public void setReason(PersonnelBlacklistReason reason) {
        this.reason = reason;
    }
}
