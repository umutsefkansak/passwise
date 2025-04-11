package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.TeamRequestDto;
import com.umut.passwise.dto.responses.TeamResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.Team;
import com.umut.passwise.repository.TeamRepository;
import com.umut.passwise.service.abstracts.ITeamService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TeamServiceImpl implements ITeamService {

    private final TeamRepository teamRepository;

    @Autowired
    public TeamServiceImpl(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @Override
    public List<TeamResponseDto> findAll() {
        List<Team> teamlist = teamRepository.findAll();
        List<TeamResponseDto> dtoList = new ArrayList<>();

        for(Team team: teamlist){
            TeamResponseDto dto = new TeamResponseDto();
            BeanUtils.copyProperties(team, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<TeamResponseDto> findById(Long id) {
        Optional<Team> team = teamRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (team.isPresent()) {
            TeamResponseDto dto = new TeamResponseDto();
            BeanUtils.copyProperties(team.get(), dto);  // team.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public TeamResponseDto save(TeamRequestDto teamRequestDto) {
        Team team = new Team();
        TeamResponseDto teamResponseDto = new TeamResponseDto();

        BeanUtils.copyProperties(teamRequestDto, team);

        teamRepository.save(team);

        BeanUtils.copyProperties(team, teamResponseDto);

        return teamResponseDto;
    }

    @Override
    public TeamResponseDto update(Long id, TeamRequestDto teamRequestDto) {
        // Mevcut entity'yi bul
        Optional<Team> teamOptional = teamRepository.findById(id);

        if (teamOptional.isPresent()) {
            Team team = teamOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(teamRequestDto, team);

            // Güncellenmiş entity'yi kaydet
            teamRepository.save(team);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            TeamResponseDto teamResponseDto = new TeamResponseDto();
            BeanUtils.copyProperties(team, teamResponseDto);

            return teamResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("Team with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        teamRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return teamRepository.existsById(id);
    }
}
