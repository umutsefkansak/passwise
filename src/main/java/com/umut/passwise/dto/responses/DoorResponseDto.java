package com.umut.passwise.dto.responses;

import com.umut.passwise.entities.AccessDirection;
import com.umut.passwise.entities.DoorType;
import com.umut.passwise.entities.QrCode;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;


@AllArgsConstructor
@NoArgsConstructor
public class DoorResponseDto {
    private String name;
    private String location;
    private Boolean isMainDoor = false;
    private DoorType doorType;
    private AccessDirection accessDirection;
    private QrCode qrCode;

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

    public Boolean getMainDoor() {
        return isMainDoor;
    }

    public void setMainDoor(Boolean mainDoor) {
        isMainDoor = mainDoor;
    }

    public DoorType getDoorType() {
        return doorType;
    }

    public void setDoorType(DoorType doorType) {
        this.doorType = doorType;
    }

    public AccessDirection getAccessDirection() {
        return accessDirection;
    }

    public void setAccessDirection(AccessDirection accessDirection) {
        this.accessDirection = accessDirection;
    }

    public QrCode getQrCode() {
        return qrCode;
    }

    public void setQrCode(QrCode qrCode) {
        this.qrCode = qrCode;
    }
}
