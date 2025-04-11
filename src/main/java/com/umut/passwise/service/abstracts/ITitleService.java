package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.TitleRequestDto;
import com.umut.passwise.dto.responses.TitleResponseDto;

public interface ITitleService {

    List<TitleResponseDto> findAll();

    Optional<TitleResponseDto> findById(Long id);

    TitleResponseDto save(TitleRequestDto titleRequestDto);

    TitleResponseDto update(Long id, TitleRequestDto titleRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
