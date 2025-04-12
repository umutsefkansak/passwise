package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.PersonnelPermissionGroupRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionGroupResponseDto;
import com.umut.passwise.entities.Personnel;

public interface IPersonnelPermissionGroupService {

    List<PersonnelPermissionGroupResponseDto> findAll();

    Optional<PersonnelPermissionGroupResponseDto> findById(Long id);

    PersonnelPermissionGroupResponseDto save(PersonnelPermissionGroupRequestDto personnelPermissionGroupRequestDto);

    PersonnelPermissionGroupResponseDto update(Long id, PersonnelPermissionGroupRequestDto personnelPermissionGroupRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);

    boolean hasIndirectPermission(Personnel personnel,Long doorId);
}
