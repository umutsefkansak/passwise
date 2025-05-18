package com.umut.passwise.dto.responses;

import com.umut.passwise.entities.Admin;
import com.umut.passwise.entities.PermissionGroup;
import com.umut.passwise.entities.Personnel;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;


@AllArgsConstructor
@NoArgsConstructor
public class PersonnelPermissionGroupResponseDto {

    private Long id;
    private Personnel personnel;
    private PermissionGroup permissionGroup;
    private Admin grantedByAdmin;
    private Timestamp grantedAt;

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

    public PermissionGroup getPermissionGroup() {
        return permissionGroup;
    }

    public void setPermissionGroup(PermissionGroup permissionGroup) {
        this.permissionGroup = permissionGroup;
    }

    public Admin getGrantedByAdmin() {
        return grantedByAdmin;
    }

    public void setGrantedByAdmin(Admin grantedByAdmin) {
        this.grantedByAdmin = grantedByAdmin;
    }

    public Timestamp getGrantedAt() {
        return grantedAt;
    }

    public void setGrantedAt(Timestamp grantedAt) {
        this.grantedAt = grantedAt;
    }
}
