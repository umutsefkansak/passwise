package com.umut.passwise.dto.requests;

import com.umut.passwise.entities.Admin;
import com.umut.passwise.entities.Door;
import com.umut.passwise.entities.Personnel;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;


@AllArgsConstructor
@NoArgsConstructor
public class PersonnelPermissionRequestDto {
    private Personnel personnel;
    private Door door;
    private Admin admin;
    private Timestamp grantedAt;

    public Personnel getPersonnel() {
        return personnel;
    }

    public void setPersonnel(Personnel personnel) {
        this.personnel = personnel;
    }

    public Door getDoor() {
        return door;
    }

    public void setDoor(Door door) {
        this.door = door;
    }

    public Admin getAdmin() {
        return admin;
    }

    public void setAdmin(Admin admin) {
        this.admin = admin;
    }

    public Timestamp getGrantedAt() {
        return grantedAt;
    }

    public void setGrantedAt(Timestamp grantedAt) {
        this.grantedAt = grantedAt;
    }

}
