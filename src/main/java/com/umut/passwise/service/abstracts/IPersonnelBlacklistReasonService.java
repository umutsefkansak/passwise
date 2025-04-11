package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.PersonnelBlacklistReasonRequestDto;
import com.umut.passwise.dto.responses.PersonnelBlacklistReasonResponseDto;

public interface IPersonnelBlacklistReasonService {

    List<PersonnelBlacklistReasonResponseDto> findAll();

    Optional<PersonnelBlacklistReasonResponseDto> findById(Long id);

    PersonnelBlacklistReasonResponseDto save(PersonnelBlacklistReasonRequestDto personnelBlacklistReasonRequestDto);

    PersonnelBlacklistReasonResponseDto update(Long id, PersonnelBlacklistReasonRequestDto personnelBlacklistReasonRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
