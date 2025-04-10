package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.Personnel;

public interface IPersonnelService {

    List<Personnel> findAll();

    Optional<Personnel> findById(Long id);

    Personnel save(Personnel personnel);

    void deleteById(Long id);

    boolean existsById(Long id);
}
