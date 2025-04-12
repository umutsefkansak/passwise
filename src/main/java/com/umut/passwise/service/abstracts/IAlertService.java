package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.AlertRequestDto;
import com.umut.passwise.dto.responses.AlertResponseDto;
import com.umut.passwise.entities.Door;
import com.umut.passwise.entities.Personnel;

public interface IAlertService {

    List<AlertResponseDto> findAll();

    Optional<AlertResponseDto> findById(Long id);

    AlertResponseDto save(AlertRequestDto alertRequestDto);

    AlertResponseDto update(Long id, AlertRequestDto alertRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);

     void createUnauthorizedAccessAlert(Personnel personnel, Door door);
}
