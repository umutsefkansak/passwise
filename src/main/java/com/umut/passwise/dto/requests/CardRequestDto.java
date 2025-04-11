package com.umut.passwise.dto.requests;

import com.umut.passwise.entities.Personnel;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
public class CardRequestDto {
    private String cardNumber;
    private Boolean isActive;
    private Personnel personel;
    private Timestamp registeredAt;
    private Timestamp deactivatedAt;

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    public Personnel getPersonel() {
        return personel;
    }

    public void setPersonel(Personnel personel) {
        this.personel = personel;
    }

    public Timestamp getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(Timestamp registeredAt) {
        this.registeredAt = registeredAt;
    }

    public Timestamp getDeactivatedAt() {
        return deactivatedAt;
    }

    public void setDeactivatedAt(Timestamp deactivatedAt) {
        this.deactivatedAt = deactivatedAt;
    }
}
