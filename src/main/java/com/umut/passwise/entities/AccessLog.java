package com.umut.passwise.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "access_logs")
public class AccessLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "personnel_id", referencedColumnName = "id")
    private Personnel personnel;

    @ManyToOne
    @JoinColumn(name = "card_id", referencedColumnName = "id")
    private Card card;

    @ManyToOne
    @JoinColumn(name = "door_id", referencedColumnName = "id", nullable = false)
    private Door door;

    @Column(name = "access_timestamp", nullable = false)
    private Timestamp accessTimestamp;

    @ManyToOne
    @JoinColumn(name = "access_method_id", referencedColumnName = "id", nullable = false)
    private AccessMethod accessMethod;

    @ManyToOne
    @JoinColumn(name = "access_result_id", referencedColumnName = "id", nullable = false)
    private AccessResult accessResult;

    @Column(name = "details")
    private String details;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    // Getters and Setters
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

    public Card getCard() {
        return card;
    }

    public void setCard(Card card) {
        this.card = card;
    }

    public Door getDoor() {
        return door;
    }

    public void setDoor(Door door) {
        this.door = door;
    }

    public Timestamp getAccessTimestamp() {
        return accessTimestamp;
    }

    public void setAccessTimestamp(Timestamp accessTimestamp) {
        this.accessTimestamp = accessTimestamp;
    }

    public AccessMethod getAccessMethod() {
        return accessMethod;
    }

    public void setAccessMethod(AccessMethod accessMethod) {
        this.accessMethod = accessMethod;
    }

    public AccessResult getAccessResult() {
        return accessResult;
    }

    public void setAccessResult(AccessResult accessResult) {
        this.accessResult = accessResult;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
