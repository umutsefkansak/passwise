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

    // Ana kapı olup olmadığını belirten alan
    @Column(name = "is_main_door", nullable = false)
    private Boolean isMainDoor = false;


    @ManyToOne
    @JoinColumn(name = "door_type_id",referencedColumnName = "id")
    private DoorType doorType;

    @ManyToOne
    @JoinColumn(name = "access_direction_id", referencedColumnName = "id", nullable = false)
    private AccessDirection accessDirection;




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

    public Boolean getMainDoor() {
        return isMainDoor;
    }

    public void setMainDoor(Boolean mainDoor) {
        isMainDoor = mainDoor;
    }

    public AccessDirection getAccessDirection() {
        return accessDirection;
    }

    public void setAccessDirection(AccessDirection accessDirection) {
        this.accessDirection = accessDirection;
    }
}
