package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.AlertTypeRequestDto;
import com.umut.passwise.dto.responses.AlertTypeResponseDto;

public interface IAlertTypeService {

    List<AlertTypeResponseDto> findAll();

    Optional<AlertTypeResponseDto> findById(Long id);

    AlertTypeResponseDto save(AlertTypeRequestDto alertTypeRequestDto);

    AlertTypeResponseDto update(Long id, AlertTypeRequestDto alertTypeRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
