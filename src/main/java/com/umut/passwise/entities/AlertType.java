//Alarm tipi adı (örn: "Yetkisiz Erişim", "Mesai Dışı Giriş" vb.)
package com.umut.passwise.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "alert_types")
public class AlertType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(name = "severity_level")
    private Integer severityLevel;  // 1: Düşük, 2: Orta, 3: Yüksek gibi

    @Column(name = "color_code")
    private String colorCode;  // Frontend'de gösterim için renk kodu (#FF0000 gibi)

    // Getters and Setters
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getSeverityLevel() {
        return severityLevel;
    }

    public void setSeverityLevel(Integer severityLevel) {
        this.severityLevel = severityLevel;
    }

    public String getColorCode() {
        return colorCode;
    }

    public void setColorCode(String colorCode) {
        this.colorCode = colorCode;
    }
}