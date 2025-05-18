package com.umut.passwise.dto.responses.dashboard;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccessTrendDto {
    private String name;
    private int personel;
    private int ziyaretci;



    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getPersonel() {
        return personel;
    }

    public void setPersonel(int personel) {
        this.personel = personel;
    }

    public int getZiyaretci() {
        return ziyaretci;
    }

    public void setZiyaretci(int ziyaretci) {
        this.ziyaretci = ziyaretci;
    }
}