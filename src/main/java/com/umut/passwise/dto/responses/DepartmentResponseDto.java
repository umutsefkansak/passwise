package com.umut.passwise.dto.responses;

import com.umut.passwise.entities.Personnel;
import jakarta.persistence.Column;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@AllArgsConstructor
@NoArgsConstructor
public class DepartmentResponseDto {

    private String name;
    private List<Personnel> personels;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Personnel> getPersonels() {
        return personels;
    }

    public void setPersonels(List<Personnel> personels) {
        this.personels = personels;
    }
}
