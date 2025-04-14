package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.FormerPersonnelRequestDto;
import com.umut.passwise.dto.responses.FormerPersonnelResponseDto;

public interface IFormerPersonnelService {

    List<FormerPersonnelResponseDto> findAll();

    Optional<FormerPersonnelResponseDto> findById(Long id);

    FormerPersonnelResponseDto save(FormerPersonnelRequestDto formerPersonnelRequestDto);

    FormerPersonnelResponseDto update(Long id, FormerPersonnelRequestDto formerPersonnelRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);

    void setPersonnelActiveState(Long personnelId, boolean isActive);
}
