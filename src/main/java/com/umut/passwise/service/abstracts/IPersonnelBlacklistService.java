package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.PersonnelBlacklistRequestDto;
import com.umut.passwise.dto.responses.PersonnelBlacklistResponseDto;

public interface IPersonnelBlacklistService {

    List<PersonnelBlacklistResponseDto> findAll();

    Optional<PersonnelBlacklistResponseDto> findById(Long id);

    PersonnelBlacklistResponseDto save(PersonnelBlacklistRequestDto personnelBlacklistRequestDto);

    PersonnelBlacklistResponseDto update(Long id, PersonnelBlacklistRequestDto personnelBlacklistRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
