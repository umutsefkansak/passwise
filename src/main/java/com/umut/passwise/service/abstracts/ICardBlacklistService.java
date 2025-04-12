package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.CardBlacklistRequestDto;
import com.umut.passwise.dto.responses.CardBlacklistResponseDto;
import com.umut.passwise.entities.Card;

public interface ICardBlacklistService {

    List<CardBlacklistResponseDto> findAll();

    Optional<CardBlacklistResponseDto> findById(Long id);

    CardBlacklistResponseDto save(CardBlacklistRequestDto cardBlacklistRequestDto);

    CardBlacklistResponseDto update(Long id, CardBlacklistRequestDto cardBlacklistRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);

    boolean existsByCard(Card card);
}
