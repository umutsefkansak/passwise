
// Personel ve yetki grubu arasındaki ilişkiyi tutan geliştirilmiş entity
package com.umut.passwise.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "personnel_permission_groups")
public class PersonnelPermissionGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "personnel_id", nullable = false)
    private Personnel personnel;

    @ManyToOne
    @JoinColumn(name = "permission_group_id", nullable = false)
    private PermissionGroup permissionGroup;

    @ManyToOne
    @JoinColumn(name = "granted_by_admin_id", nullable = false)
    private Admin grantedByAdmin;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp grantedAt;

    

    // Getters and setters
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

    public PermissionGroup getPermissionGroup() {
        return permissionGroup;
    }

    public void setPermissionGroup(PermissionGroup permissionGroup) {
        this.permissionGroup = permissionGroup;
    }

    public Admin getGrantedByAdmin() {
        return grantedByAdmin;
    }

    public void setGrantedByAdmin(Admin grantedByAdmin) {
        this.grantedByAdmin = grantedByAdmin;
    }

    public Timestamp getGrantedAt() {
        return grantedAt;
    }

    public void setGrantedAt(Timestamp grantedAt) {
        this.grantedAt = grantedAt;
    }



}