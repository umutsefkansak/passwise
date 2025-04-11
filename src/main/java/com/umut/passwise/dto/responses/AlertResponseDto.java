package com.umut.passwise.dto.responses;

import com.umut.passwise.entities.Admin;
import com.umut.passwise.entities.AlertType;
import com.umut.passwise.entities.Door;
import com.umut.passwise.entities.Personnel;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
public class AlertResponseDto {
    private Personnel personnel;
    private Door door;
    private AlertType alertType;
    private String alertMessage;
    private Boolean isResolved = false;
    private Admin resolvedByAdmin;
    private Timestamp resolvedAt;
    private Timestamp createdAt;

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

    public AlertType getAlertType() {
        return alertType;
    }

    public void setAlertType(AlertType alertType) {
        this.alertType = alertType;
    }

    public String getAlertMessage() {
        return alertMessage;
    }

    public void setAlertMessage(String alertMessage) {
        this.alertMessage = alertMessage;
    }

    public Boolean getResolved() {
        return isResolved;
    }

    public void setResolved(Boolean resolved) {
        isResolved = resolved;
    }

    public Admin getResolvedByAdmin() {
        return resolvedByAdmin;
    }

    public void setResolvedByAdmin(Admin resolvedByAdmin) {
        this.resolvedByAdmin = resolvedByAdmin;
    }

    public Timestamp getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Timestamp resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
