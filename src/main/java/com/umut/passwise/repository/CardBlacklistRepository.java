package com.umut.passwise.repository;


import com.umut.passwise.entities.Card;
import com.umut.passwise.entities.CardBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CardBlacklistRepository extends JpaRepository<CardBlacklist,Long> {
    boolean existsByCard(Card card);
    boolean existsByCardId(Long cardId);

    Optional<Card> findByCard(Card card);
}
