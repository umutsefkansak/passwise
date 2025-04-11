package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.ActionTypeRequestDto;
import com.umut.passwise.dto.responses.ActionTypeResponseDto;

public interface IActionTypeService {

    List<ActionTypeResponseDto> findAll();

    Optional<ActionTypeResponseDto> findById(Long id);

    ActionTypeResponseDto save(ActionTypeRequestDto actionTypeRequestDto);

    ActionTypeResponseDto update(Long id, ActionTypeRequestDto actionTypeRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
