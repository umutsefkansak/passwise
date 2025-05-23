package com.umut.passwise.dto.requests;

import com.umut.passwise.entities.Personnel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@AllArgsConstructor
@NoArgsConstructor
public class DepartmentRequestDto {

    private String name;
    //Sadece aralarındaki ilişki için eklendi
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
