package com.umut.passwise.entities;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Instant expiryDate;

    @ManyToOne
    @JoinColumn(name = "admin_id", referencedColumnName = "id")
    private Admin admin;

    public Long getId() {
        return id;
    }

    public RefreshToken setId(Long id) {
        this.id = id;
        return this;
    }

    public String getToken() {
        return token;
    }

    public RefreshToken setToken(String token) {
        this.token = token;
        return this;
    }

    public Instant getExpiryDate() {
        return expiryDate;
    }

    public RefreshToken setExpiryDate(Instant expiryDate) {
        this.expiryDate = expiryDate;
        return this;
    }

    public Admin getAdmin() {
        return admin;
    }

    public RefreshToken setAdmin(Admin admin) {
        this.admin = admin;
        return this;
    }
}