package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.AccessDirectionRequestDto;
import com.umut.passwise.dto.responses.AccessDirectionResponseDto;

public interface IAccessDirectionService {

    List<AccessDirectionResponseDto> findAll();

    Optional<AccessDirectionResponseDto> findById(Long id);

    AccessDirectionResponseDto save(AccessDirectionRequestDto accessDirectionRequestDto);

    AccessDirectionResponseDto update(Long id, AccessDirectionRequestDto accessDirectionRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
