package com.umut.passwise.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;


@Entity
@Table(name = "card_blacklist")
public class CardBlacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "card_id",referencedColumnName = "id",unique = true)
    private Card card;


    @ManyToOne
    @JoinColumn(name = "reason_id",referencedColumnName = "id")
    private CardBlacklistReason reason;


    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp dateAdded;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
