package com.umut.passwise.entities;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "cards")
public class Card {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cardNumber;

    private Boolean isActive;

    @OneToOne(mappedBy = "card")
    private Personnel personel;

    @ManyToOne
    @JoinColumn(name = "card_type_id", referencedColumnName = "id")
    private CardType cardType;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp registeredAt;

    @UpdateTimestamp
    @Column
    private Timestamp deactivatedAt;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public CardType getCardType() {
        return cardType;
    }

    public void setCardType(CardType cardType) {
        this.cardType = cardType;
    }
}
