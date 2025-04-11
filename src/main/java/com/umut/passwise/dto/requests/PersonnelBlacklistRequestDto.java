package com.umut.passwise.dto.requests;

import com.umut.passwise.entities.Personnel;
import com.umut.passwise.entities.PersonnelBlacklistReason;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;


@AllArgsConstructor
@NoArgsConstructor
public class PersonnelBlacklistRequestDto {
    private Personnel personnel;
    private PersonnelBlacklistReason reason;
    private Timestamp dateAdded;

    public Personnel getPersonnel() {
        return personnel;
    }

    public void setPersonnel(Personnel personnel) {
        this.personnel = personnel;
    }

    public PersonnelBlacklistReason getReason() {
        return reason;
    }

    public void setReason(PersonnelBlacklistReason reason) {
        this.reason = reason;
    }

    public Timestamp getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(Timestamp dateAdded) {
        this.dateAdded = dateAdded;
    }

}
