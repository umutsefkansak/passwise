// Person Type Entity (Personel türleri için)
package com.umut.passwise.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "person_types")
public class PersonType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @OneToMany(mappedBy = "personType")
    private Set<Personnel> personnels = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "created_by_admin_id", referencedColumnName = "id")
    private Admin createdByAdmin;

    @ManyToOne
    @JoinColumn(name = "last_modified_by_admin_id", referencedColumnName = "id")
    private Admin lastModifiedByAdmin;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column
    private Timestamp updatedAt;

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


    public Set<Personnel> getPersonnels() {
        return personnels;
    }

    public void setPersonnels(Set<Personnel> personnels) {
        this.personnels = personnels;
    }

    public Admin getCreatedByAdmin() {
        return createdByAdmin;
    }

    public void setCreatedByAdmin(Admin createdByAdmin) {
        this.createdByAdmin = createdByAdmin;
    }

    public Admin getLastModifiedByAdmin() {
        return lastModifiedByAdmin;
    }

    public void setLastModifiedByAdmin(Admin lastModifiedByAdmin) {
        this.lastModifiedByAdmin = lastModifiedByAdmin;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}