package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.Team;

public interface ITeamService {

    List<Team> findAll();

    Optional<Team> findById(Long id);

    Team save(Team team);

    void deleteById(Long id);

    boolean existsById(Long id);
}
