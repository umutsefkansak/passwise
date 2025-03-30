package com.umut.passwise.entities;


import jakarta.persistence.*;

@Entity
@Table(name = "doors")
public class Door {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,unique = true)
    private String name;

    private String location;

    @ManyToOne
    @JoinColumn(name = "doortype_id",referencedColumnName = "id")
    private DoorType doorType;

    @ManyToOne
    @JoinColumn(name = "access_direction_id", referencedColumnName = "id", nullable = false)
    private AccessDirection accessDirection;


    @OneToOne(mappedBy = "door")
    private QrCode qrCode;


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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public DoorType getDoorType() {
        return doorType;
    }

    public void setDoorType(DoorType doorType) {
        this.doorType = doorType;
    }


}
