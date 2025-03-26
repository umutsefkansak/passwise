package com.umut.passwise.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "blacklist")
public class Blacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "card_id",referencedColumnName = "id")
    private Card card;


    @ManyToOne
    @JoinColumn(name = "reason_id",referencedColumnName = "id")
    private BlacklistReason reason;


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

    public BlacklistReason getReason() {
        return reason;
    }

    public void setReason(BlacklistReason reason) {
        this.reason = reason;
    }

    public Timestamp getDateAdded() {
        return dateAdded;
    }

    public void setDateAdded(Timestamp dateAdded) {
        this.dateAdded = dateAdded;
    }
}
