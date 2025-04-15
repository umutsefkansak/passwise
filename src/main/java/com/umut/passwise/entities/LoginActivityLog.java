package com.umut.passwise.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_activity_logs")
public class LoginActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String action; // LOGIN, LOGOUT, REFRESH

    @Column
    private String ipAddress;

    @Column
    private String userAgent;

    public Long getId() {
        return id;
    }

    public LoginActivityLog setId(Long id) {
        this.id = id;
        return this;
    }

    public Admin getAdmin() {
        return admin;
    }

    public LoginActivityLog setAdmin(Admin admin) {
        this.admin = admin;
        return this;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public LoginActivityLog setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
        return this;
    }

    public String getAction() {
        return action;
    }

    public LoginActivityLog setAction(String action) {
        this.action = action;
        return this;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public LoginActivityLog setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
        return this;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public LoginActivityLog setUserAgent(String userAgent) {
        this.userAgent = userAgent;
        return this;
    }
}