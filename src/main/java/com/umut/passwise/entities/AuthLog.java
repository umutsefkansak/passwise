package com.umut.passwise.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "auth_logs")
public class AuthLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "admin_id", referencedColumnName = "id", nullable = false)
    private Admin admin;

    @ManyToOne
    @JoinColumn(name = "personnel_id", referencedColumnName = "id", nullable = false)
    private Personnel personnel;

    @ManyToOne
    @JoinColumn(name = "door_id", referencedColumnName = "id")
    private Door door;

    @ManyToOne
    @JoinColumn(name = "permission_group_id", referencedColumnName = "id")
    private PermissionGroup permissionGroup;

    @Column(name = "auth_date", nullable = false)
    @CreationTimestamp
    private Timestamp authDate;

    @Column(name = "description")
    private String description;

    @ManyToOne
    @JoinColumn(name = "action_type_id", referencedColumnName = "id")
    private ActionType actionType; // GRANT, REVOKE gibi değerler için

    // Eklenen yeni alan: İşlem bir yetki grubu üzerinden mi yapıldı
    @Column(name = "is_group_permission")
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

    public Boolean getIsGroupPermission() {
        return isGroupPermission;
    }

    public void setIsGroupPermission(Boolean isGroupPermission) {
        this.isGroupPermission = isGroupPermission;
    }
}