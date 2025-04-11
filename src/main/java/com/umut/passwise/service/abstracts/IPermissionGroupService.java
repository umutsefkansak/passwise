package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.PermissionGroupRequestDto;
import com.umut.passwise.dto.responses.PermissionGroupResponseDto;

public interface IPermissionGroupService {

    List<PermissionGroupResponseDto> findAll();

    Optional<PermissionGroupResponseDto> findById(Long id);

    PermissionGroupResponseDto save(PermissionGroupRequestDto permissionGroupRequestDto);

    PermissionGroupResponseDto update(Long id, PermissionGroupRequestDto permissionGroupRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
