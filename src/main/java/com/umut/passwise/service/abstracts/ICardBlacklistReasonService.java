package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.CardBlacklistReason;

public interface ICardBlacklistReasonService {

    List<CardBlacklistReason> findAll();

    Optional<CardBlacklistReason> findById(Long id);

    CardBlacklistReason save(CardBlacklistReason cardBlacklistReason);

    void deleteById(Long id);

    boolean existsById(Long id);
}
