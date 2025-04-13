package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.PersonnelPermissionRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionResponseDto;
import com.umut.passwise.entities.Door;
import com.umut.passwise.entities.Personnel;

public interface IPersonnelPermissionService {

    List<PersonnelPermissionResponseDto> findAll();

    Optional<PersonnelPermissionResponseDto> findById(Long id);

    PersonnelPermissionResponseDto save(PersonnelPermissionRequestDto personnelPermissionRequestDto);

    PersonnelPermissionResponseDto update(Long id, PersonnelPermissionRequestDto personnelPermissionRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);

    boolean existsByPersonnelAndDoor(Personnel personnel, Door door);

    void deleteByPersonnelAndDoor(Personnel personnel, Door door);

}
