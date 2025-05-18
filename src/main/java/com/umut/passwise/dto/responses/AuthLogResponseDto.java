package com.umut.passwise.dto.responses;

import com.umut.passwise.entities.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
public class AuthLogResponseDto {

    private Long id;
    private Admin admin;
    private Personnel personnel;
    private Door door;
    private PermissionGroup permissionGroup;
    private Timestamp authDate;
    private String description;
    private ActionType actionType; // GRANT, REVOKE gibi değerler için

    // Eklenen yeni alan: İşlem bir yetki grubu üzerinden mi yapıldı
    private Boolean isGroupPermission = false;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Admin getAdmin() {
        return admin;
    }

    public void setAdmin(Admin admin) {
        this.admin = admin;
    }

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

    public PermissionGroup getPermissionGroup() {
        return permissionGroup;
    }

    public void setPermissionGroup(PermissionGroup permissionGroup) {
        this.permissionGroup = permissionGroup;
    }

    public Timestamp getAuthDate() {
        return authDate;
    }

    public void setAuthDate(Timestamp authDate) {
        this.authDate = authDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ActionType getActionType() {
        return actionType;
    }

    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }

    public Boolean getGroupPermission() {
        return isGroupPermission;
    }

    public void setGroupPermission(Boolean groupPermission) {
        isGroupPermission = groupPermission;
    }
}
