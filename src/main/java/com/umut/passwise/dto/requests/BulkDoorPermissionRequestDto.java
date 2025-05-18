// Birden fazla kapı yetkisi eklemek için DTO
package com.umut.passwise.dto.requests;

import java.util.List;

public class BulkDoorPermissionRequestDto {

    private Long id;

    private Long personnelId;
    private List<Long> doorIds;
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

    public List<Long> getDoorIds() {
        return doorIds;
    }

    public void setDoorIds(List<Long> doorIds) {
        this.doorIds = doorIds;
    }

    public Long getAdminId() {
        return adminId;
    }

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }
}