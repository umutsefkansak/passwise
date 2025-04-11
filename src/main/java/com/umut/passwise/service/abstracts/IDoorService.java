package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.DoorRequestDto;
import com.umut.passwise.dto.responses.DoorResponseDto;

public interface IDoorService {

    List<DoorResponseDto> findAll();

    Optional<DoorResponseDto> findById(Long id);

    DoorResponseDto save(DoorRequestDto doorRequestDto);

    DoorResponseDto update(Long id, DoorRequestDto doorRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
