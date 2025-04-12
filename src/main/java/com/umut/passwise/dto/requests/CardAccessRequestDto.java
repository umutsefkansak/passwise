// CardAccessRequestDto - Kart geçiş isteği verileri için DTO
package com.umut.passwise.dto.requests;

public class CardAccessRequestDto {
    private String cardNumber;
    private Long doorId;

    // Constructors
    public CardAccessRequestDto() {}

    public CardAccessRequestDto(String cardNumber, Long doorId) {
        this.cardNumber = cardNumber;
        this.doorId = doorId;
    }

    // Getters and setters
    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public Long getDoorId() {
        return doorId;
    }

    public void setDoorId(Long doorId) {
        this.doorId = doorId;
    }
}