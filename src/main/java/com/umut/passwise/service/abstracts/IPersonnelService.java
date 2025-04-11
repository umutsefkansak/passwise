package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.PersonnelRequestDto;
import com.umut.passwise.dto.responses.PersonnelResponseDto;

public interface IPersonnelService {

    List<PersonnelResponseDto> findAll();

    Optional<PersonnelResponseDto> findById(Long id);

    PersonnelResponseDto save(PersonnelRequestDto personnelRequestDto);

    PersonnelResponseDto update(Long id, PersonnelRequestDto personnelRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
