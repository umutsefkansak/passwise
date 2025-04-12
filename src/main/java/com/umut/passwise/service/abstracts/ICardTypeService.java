package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.CardTypeRequestDto;
import com.umut.passwise.dto.responses.CardTypeResponseDto;

public interface ICardTypeService {

    List<CardTypeResponseDto> findAll();

    Optional<CardTypeResponseDto> findById(Long id);

    CardTypeResponseDto save(CardTypeRequestDto cardTypeRequestDto);

    CardTypeResponseDto update(Long id, CardTypeRequestDto cardTypeRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
