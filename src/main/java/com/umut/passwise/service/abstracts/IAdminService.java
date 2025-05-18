package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.AdminRequestDto;
import com.umut.passwise.dto.responses.AdminResponseDto;

public interface IAdminService {

    List<AdminResponseDto> findAll();

    Optional<AdminResponseDto> findById(Long id);

    AdminResponseDto save(AdminRequestDto adminRequestDto);

    AdminResponseDto update(Long id, AdminRequestDto adminRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
    Optional<AdminResponseDto> findByUsername(String username);
}
