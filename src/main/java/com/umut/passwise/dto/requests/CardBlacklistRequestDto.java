package com.umut.passwise.dto.requests;

import com.umut.passwise.entities.Card;
import com.umut.passwise.entities.CardBlacklistReason;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;


import java.sql.Timestamp;


@AllArgsConstructor
@NoArgsConstructor
public class CardBlacklistRequestDto {
    private Card card;
    private CardBlacklistReason reason;
    private Timestamp dateAdded;

    public Card getCard() {
        return card;
    }

    public void setCard(Card card) {
        this.card = card;
    }

    public CardBlacklistReason getReason() {
        return reason;
    }

    public void setReason(CardBlacklistReason reason) {
        this.reason = reason;
    }

    public Timestamp getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(Timestamp dateAdded) {
        this.dateAdded = dateAdded;
    }
}
