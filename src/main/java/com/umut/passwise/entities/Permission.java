//Yetkiler tek kapı yetkileri için
package com.umut.passwise.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "permissions")
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "door_id")
    private Door door;

    @ManyToOne
    @JoinColumn(name = "permission_group_id")
    private PermissionGroup permissionGroup;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
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
}
