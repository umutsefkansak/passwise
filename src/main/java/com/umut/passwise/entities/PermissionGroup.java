//Yetki grupları (tek seferde birden fazla yetki için örn Ortak yetkiler)
package com.umut.passwise.entities;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "permission_groups")
public class PermissionGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "permissionGroup")
    private Set<Permission> permissions;

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Set<Permission> getPermissions() {
        return permissions;
    }
    public void setPermissions(Set<Permission> permissions) {
        this.permissions = permissions;
    }
}
