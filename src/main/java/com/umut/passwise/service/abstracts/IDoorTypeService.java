package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.DoorTypeRequestDto;
import com.umut.passwise.dto.responses.DoorTypeResponseDto;

public interface IDoorTypeService {

    List<DoorTypeResponseDto> findAll();

    Optional<DoorTypeResponseDto> findById(Long id);

    DoorTypeResponseDto save(DoorTypeRequestDto doorTypeRequestDto);

    DoorTypeResponseDto update(Long id, DoorTypeRequestDto doorTypeRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
