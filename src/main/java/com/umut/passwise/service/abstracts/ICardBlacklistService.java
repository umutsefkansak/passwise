package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.CardBlacklistRequestDto;
import com.umut.passwise.dto.responses.CardBlacklistResponseDto;

public interface ICardBlacklistService {

    List<CardBlacklistResponseDto> findAll();

    Optional<CardBlacklistResponseDto> findById(Long id);

    CardBlacklistResponseDto save(CardBlacklistRequestDto cardBlacklistRequestDto);

    CardBlacklistResponseDto update(Long id, CardBlacklistRequestDto cardBlacklistRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
