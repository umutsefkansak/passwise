package com.umut.passwise.repository;

import com.umut.passwise.entities.BlacklistReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlacklistReasonRepository extends JpaRepository<BlacklistReason,Long> {
}
