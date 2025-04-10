package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.CardBlacklist;

public interface ICardBlacklistService {

    List<CardBlacklist> findAll();

    Optional<CardBlacklist> findById(Long id);

    CardBlacklist save(CardBlacklist cardBlacklist);

    void deleteById(Long id);

    boolean existsById(Long id);
}
