package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.Door;

public interface IDoorService {

    List<Door> findAll();

    Optional<Door> findById(Long id);

    Door save(Door door);

    void deleteById(Long id);

    boolean existsById(Long id);
}
