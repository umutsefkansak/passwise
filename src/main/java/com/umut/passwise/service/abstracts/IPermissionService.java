package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.PermissionRequestDto;
import com.umut.passwise.dto.responses.PermissionResponseDto;

public interface IPermissionService {

    List<PermissionResponseDto> findAll();

    Optional<PermissionResponseDto> findById(Long id);

    PermissionResponseDto save(PermissionRequestDto permissionRequestDto);

    PermissionResponseDto update(Long id, PermissionRequestDto permissionRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
