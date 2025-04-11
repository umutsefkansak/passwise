package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.AccessLogRequestDto;
import com.umut.passwise.dto.responses.AccessLogResponseDto;

public interface IAccessLogService {

    List<AccessLogResponseDto> findAll();

    Optional<AccessLogResponseDto> findById(Long id);

    AccessLogResponseDto save(AccessLogRequestDto accessLogRequestDto);

    AccessLogResponseDto update(Long id, AccessLogRequestDto accessLogRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
