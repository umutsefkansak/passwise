package com.umut.passwise.repository;

import com.umut.passwise.entities.CardBlacklistReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardBlacklistReasonRepository extends JpaRepository<CardBlacklistReason,Long> {
}
