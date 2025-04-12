package com.umut.passwise.repository;

import com.umut.passwise.entities.CardType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardTypeRepository extends JpaRepository<CardType,Long> {
}
