package com.umut.passwise.dto.responses;

import com.umut.passwise.entities.Door;
import com.umut.passwise.entities.PermissionGroup;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;


@AllArgsConstructor
@NoArgsConstructor
public class PermissionResponseDto {
    private Door door;
    private PermissionGroup permissionGroup;


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
