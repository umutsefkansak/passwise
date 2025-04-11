package com.umut.passwise.dto.requests;

import com.umut.passwise.entities.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.Set;


@AllArgsConstructor
@NoArgsConstructor
public class PersonnelRequestDto {
    private String name;
    private String surname;
    private String tcNum;
    private String username;
    private String password;
    private boolean isActive = true;
    private Timestamp hireDate;
    private PersonType personType;
    private Department department;
    private Team team;
    private Title title;
    private Card card;
    private Set<PersonnelPermission> doorPermissions;
    private Set<PersonnelPermissionGroup> permissionGroupMemberships;
    private Admin createdByAdmin;
    private Admin lastModifiedByAdmin;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    // Yeni fotoğraf dosya adı alanı
    private String photoFileName;

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

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public Timestamp getHireDate() {
        return hireDate;
    }

    public void setHireDate(Timestamp hireDate) {
        this.hireDate = hireDate;
    }

    public PersonType getPersonType() {
        return personType;
    }

    public void setPersonType(PersonType personType) {
        this.personType = personType;
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

    public Set<PersonnelPermission> getDoorPermissions() {
        return doorPermissions;
    }

    public void setDoorPermissions(Set<PersonnelPermission> doorPermissions) {
        this.doorPermissions = doorPermissions;
    }

    public Set<PersonnelPermissionGroup> getPermissionGroupMemberships() {
        return permissionGroupMemberships;
    }

    public void setPermissionGroupMemberships(Set<PersonnelPermissionGroup> permissionGroupMemberships) {
        this.permissionGroupMemberships = permissionGroupMemberships;
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

    public String getPhotoFileName() {
        return photoFileName;
    }

    public void setPhotoFileName(String photoFileName) {
        this.photoFileName = photoFileName;
    }
}
