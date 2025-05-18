// Birden fazla yetki grubu eklemek için DTO
package com.umut.passwise.dto.requests;

import java.util.List;

public class BulkPermissionGroupRequestDto {

    private Long id;
    private Long personnelId;
    private List<Long> permissionGroupIds;
    private Long adminId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPersonnelId() {
        return personnelId;
    }

    public void setPersonnelId(Long personnelId) {
        this.personnelId = personnelId;
    }

    public List<Long> getPermissionGroupIds() {
        return permissionGroupIds;
    }

    public void setPermissionGroupIds(List<Long> permissionGroupIds) {
        this.permissionGroupIds = permissionGroupIds;
    }

    public Long getAdminId() {
        return adminId;
    }

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }
}