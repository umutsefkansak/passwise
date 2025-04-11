package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.DepartmentRequestDto;
import com.umut.passwise.dto.responses.DepartmentResponseDto;

public interface IDepartmentService {

    List<DepartmentResponseDto> findAll();

    Optional<DepartmentResponseDto> findById(Long id);

    DepartmentResponseDto save(DepartmentRequestDto departmentRequestDto);

    DepartmentResponseDto update(Long id, DepartmentRequestDto departmentRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
