package com.umut.passwise.dto.responses;

import com.umut.passwise.entities.Admin;
import com.umut.passwise.entities.Personnel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;


@AllArgsConstructor
@NoArgsConstructor
public class FormerPersonnelResponseDto {
    private Personnel personnel;
    private Timestamp terminationDate;
    private Admin admin;

    public Personnel getPersonnel() {
        return personnel;
    }

    public void setPersonnel(Personnel personnel) {
        this.personnel = personnel;
    }

    public Timestamp getTerminationDate() {
        return terminationDate;
    }

    public void setTerminationDate(Timestamp terminationDate) {
        this.terminationDate = terminationDate;
    }

    public Admin getAdmin() {
        return admin;
    }

    public void setAdmin(Admin admin) {
        this.admin = admin;
    }

}
