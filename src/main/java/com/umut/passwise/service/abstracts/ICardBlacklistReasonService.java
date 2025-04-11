package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.CardBlacklistReasonRequestDto;
import com.umut.passwise.dto.responses.CardBlacklistReasonResponseDto;

public interface ICardBlacklistReasonService {

    List<CardBlacklistReasonResponseDto> findAll();

    Optional<CardBlacklistReasonResponseDto> findById(Long id);

    CardBlacklistReasonResponseDto save(CardBlacklistReasonRequestDto cardBlacklistReasonRequestDto);

    CardBlacklistReasonResponseDto update(Long id, CardBlacklistReasonRequestDto cardBlacklistReasonRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
