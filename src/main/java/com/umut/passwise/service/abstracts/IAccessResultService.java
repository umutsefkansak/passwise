package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.AccessResultRequestDto;
import com.umut.passwise.dto.responses.AccessResultResponseDto;
import com.umut.passwise.entities.AccessResult;

public interface IAccessResultService {

    List<AccessResultResponseDto> findAll();

    Optional<AccessResultResponseDto> findById(Long id);

    AccessResultResponseDto save(AccessResultRequestDto accessResultRequestDto);

    AccessResultResponseDto update(Long id, AccessResultRequestDto accessResultRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);

}
