package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.AuthLogRequestDto;
import com.umut.passwise.dto.responses.AuthLogResponseDto;

public interface IAuthLogService {

    List<AuthLogResponseDto> findAll();

    Optional<AuthLogResponseDto> findById(Long id);

    AuthLogResponseDto save(AuthLogRequestDto authLogRequestDto);

    AuthLogResponseDto update(Long id, AuthLogRequestDto authLogRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
