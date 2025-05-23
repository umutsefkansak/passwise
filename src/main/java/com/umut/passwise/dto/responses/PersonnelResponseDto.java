package com.umut.passwise.dto.responses;

import com.umut.passwise.entities.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.Set;


@AllArgsConstructor
@NoArgsConstructor
public class PersonnelResponseDto {
    private Long id; // ID alanı eklendi, controller'da kullanılacak
    private String name;
    private String surname;
    private String tcNum;
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
    private String photoFileName;

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
