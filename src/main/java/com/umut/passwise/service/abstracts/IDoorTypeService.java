package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.DoorType;

public interface IDoorTypeService {

    List<DoorType> findAll();

    Optional<DoorType> findById(Long id);

    DoorType save(DoorType doorType);

    void deleteById(Long id);

    boolean existsById(Long id);
}
