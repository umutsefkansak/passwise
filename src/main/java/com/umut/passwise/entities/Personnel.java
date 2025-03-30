package com.umut.passwise.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "personnels")
public class Personnel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String surname;

    private String tcNum;

    private String username;
    private String password;

    @ManyToOne
    @JoinColumn(name = "department_id", referencedColumnName = "id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "team_id", referencedColumnName = "id")
    private Team team;

    @ManyToOne
    @JoinColumn(name = "title_id", referencedColumnName = "id")
    private Title title;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "card_id", referencedColumnName = "id")
    private Card card;

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

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getTcNum() {
        return tcNum;
    }

    public void setTcNum(String tcNum) {
        this.tcNum = tcNum;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public Title getTitle() {
        return title;
    }

    public void setTitle(Title title) {
        this.title = title;
    }

    public Card getCard() {
        return card;
    }

    public void setCard(Card card) {
        this.card = card;
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