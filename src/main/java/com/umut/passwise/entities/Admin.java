package com.umut.passwise.entities;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "admins")
public class Admin implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String surname;

    @Column(unique = true,nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;


    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AuthLog> logs = new ArrayList<>();

    // Giriş/çıkış aktiviteleri için yeni log listesi
    @OneToMany(mappedBy = "admin", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LoginActivityLog> loginActivities = new ArrayList<>();


    public Long getId() {
        return id;
    }

    public Admin setId(Long id) {
        this.id = id;
        return this;
    }

    public String getName() {
        return name;
    }

    public Admin setName(String name) {
        this.name = name;
        return this;
    }

    public String getSurname() {
        return surname;
    }

    public Admin setSurname(String surname) {
        this.surname = surname;
        return this;

    }


    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }

    public Admin setUsername(String username) {
        this.username = username;
        return this;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    public String getPassword() {
        return password;
    }

    public Admin setPassword(String password) {
        this.password = password;
        return this;
    }
    @Override
    public String getUsername() {
        return username;
    }

    public List<LoginActivityLog> getLoginActivities() {
        return loginActivities;
    }

    public Admin setLoginActivities(List<LoginActivityLog> loginActivities) {
        this.loginActivities = loginActivities;
        return this;
    }


}
