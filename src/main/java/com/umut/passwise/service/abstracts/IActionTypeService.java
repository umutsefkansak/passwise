package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.ActionType;

public interface IActionTypeService {

    List<ActionType> findAll();

    Optional<ActionType> findById(Long id);

    ActionType save(ActionType actionType);

    void deleteById(Long id);

    boolean existsById(Long id);
}
