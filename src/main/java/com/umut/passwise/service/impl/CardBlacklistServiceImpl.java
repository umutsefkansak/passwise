package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.CardBlacklist;
import com.umut.passwise.repository.CardBlacklistRepository;
import com.umut.passwise.service.abstracts.ICardBlacklistService;

import java.util.List;
import java.util.Optional;

@Service
public class CardBlacklistServiceImpl implements ICardBlacklistService {

    private final CardBlacklistRepository cardBlacklistRepository;

    @Autowired
    public CardBlacklistServiceImpl(CardBlacklistRepository cardBlacklistRepository) {
        this.cardBlacklistRepository = cardBlacklistRepository;
    }

    @Override
    public List<CardBlacklist> findAll() {
        return cardBlacklistRepository.findAll();
    }

    @Override
    public Optional<CardBlacklist> findById(Long id) {
        return cardBlacklistRepository.findById(id);
    }

    @Override
    public CardBlacklist save(CardBlacklist cardBlacklist) {
        return cardBlacklistRepository.save(cardBlacklist);
    }

    @Override
    public void deleteById(Long id) {
        cardBlacklistRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return cardBlacklistRepository.existsById(id);
    }
}
