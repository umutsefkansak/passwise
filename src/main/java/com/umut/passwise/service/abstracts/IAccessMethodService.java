package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.AccessMethodRequestDto;
import com.umut.passwise.dto.responses.AccessMethodResponseDto;

public interface IAccessMethodService {

    List<AccessMethodResponseDto> findAll();

    Optional<AccessMethodResponseDto> findById(Long id);

    AccessMethodResponseDto save(AccessMethodRequestDto accessMethodRequestDto);

    AccessMethodResponseDto update(Long id, AccessMethodRequestDto accessMethodRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
