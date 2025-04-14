package com.umut.passwise.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "former_personnels")
public class FormerPersonnel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "personnel_id",referencedColumnName = "id")
    private Personnel personnel;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp terminationDate;

    @ManyToOne
    @JoinColumn(name = "admin_id", nullable = false,referencedColumnName = "id")
    private Admin admin;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Personnel getPersonnel() {
        return personnel;
    }

    public void setPersonnel(Personnel personnel) {
        this.personnel = personnel;
    }

    public Timestamp getTerminationDate() {
        return terminationDate;
    }

    public void setTerminationDate(Timestamp terminationDate) {
        this.terminationDate = terminationDate;
    }

    public Admin getAdmin() {
        return admin;
    }
    public void setAdmin(Admin admin) {
        this.admin = admin;
    }
}
