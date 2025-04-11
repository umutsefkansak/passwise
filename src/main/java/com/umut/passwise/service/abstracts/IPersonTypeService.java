package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.PersonTypeRequestDto;
import com.umut.passwise.dto.responses.PersonTypeResponseDto;

public interface IPersonTypeService {

    List<PersonTypeResponseDto> findAll();

    Optional<PersonTypeResponseDto> findById(Long id);

    PersonTypeResponseDto save(PersonTypeRequestDto personTypeRequestDto);

    PersonTypeResponseDto update(Long id, PersonTypeRequestDto personTypeRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
