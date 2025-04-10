package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.CardBlacklistReason;
import com.umut.passwise.repository.CardBlacklistReasonRepository;
import com.umut.passwise.service.abstracts.ICardBlacklistReasonService;

import java.util.List;
import java.util.Optional;

@Service
public class CardBlacklistReasonServiceImpl implements ICardBlacklistReasonService {

    private final CardBlacklistReasonRepository cardBlacklistReasonRepository;

    @Autowired
    public CardBlacklistReasonServiceImpl(CardBlacklistReasonRepository cardBlacklistReasonRepository) {
        this.cardBlacklistReasonRepository = cardBlacklistReasonRepository;
    }

    @Override
    public List<CardBlacklistReason> findAll() {
        return cardBlacklistReasonRepository.findAll();
    }

    @Override
    public Optional<CardBlacklistReason> findById(Long id) {
        return cardBlacklistReasonRepository.findById(id);
    }

    @Override
    public CardBlacklistReason save(CardBlacklistReason cardBlacklistReason) {
        return cardBlacklistReasonRepository.save(cardBlacklistReason);
    }

    @Override
    public void deleteById(Long id) {
        cardBlacklistReasonRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return cardBlacklistReasonRepository.existsById(id);
    }
}
