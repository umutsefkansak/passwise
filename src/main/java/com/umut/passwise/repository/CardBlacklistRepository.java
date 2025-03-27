package com.umut.passwise.repository;


import com.umut.passwise.entities.CardBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardBlacklistRepository extends JpaRepository<CardBlacklist,Long> {
}
