package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.CardRequestDto;
import com.umut.passwise.dto.responses.CardResponseDto;
import com.umut.passwise.entities.Card;

public interface ICardService {

    List<CardResponseDto> findAll();

    Optional<CardResponseDto> findById(Long id);

    CardResponseDto save(CardRequestDto cardRequestDto);

    CardResponseDto update(Long id, CardRequestDto cardRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);

}
