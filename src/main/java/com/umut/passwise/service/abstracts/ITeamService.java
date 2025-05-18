package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.TeamRequestDto;
import com.umut.passwise.dto.responses.TeamResponseDto;

public interface ITeamService {

    List<TeamResponseDto> findAll();

    Optional<TeamResponseDto> findById(Long id);

    TeamResponseDto save(TeamRequestDto teamRequestDto);

    TeamResponseDto update(Long id, TeamRequestDto teamRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);

    List<TeamResponseDto> findByDepartmentId(Long departmentId);
}
