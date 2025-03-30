package com.umut.passwise.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "personnel_id", referencedColumnName = "id", nullable = false)
    private Personnel personnel;

    @ManyToOne
    @JoinColumn(name = "door_id", referencedColumnName = "id", nullable = false)
    private Door door;

    @ManyToOne
    @JoinColumn(name = "alert_type_id", referencedColumnName = "id", nullable = false)
    private AlertType alertType;

    @Column(name = "alert_message")
    private String alertMessage;

    @Column(name = "is_resolved", nullable = false)
    private Boolean isResolved = false;

    @ManyToOne
    @JoinColumn(name = "resolved_by_admin_id", referencedColumnName = "id")
    private Admin resolvedByAdmin;

    @Column(name = "resolved_at")
    private Timestamp resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;


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

    public Boolean getIsResolved() {
        return isResolved;
    }

    public void setIsResolved(Boolean isResolved) {
        this.isResolved = isResolved;
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