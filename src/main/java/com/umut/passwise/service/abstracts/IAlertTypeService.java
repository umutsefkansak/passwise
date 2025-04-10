package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.AlertType;

public interface IAlertTypeService {

    List<AlertType> findAll();

    Optional<AlertType> findById(Long id);

    AlertType save(AlertType alertType);

    void deleteById(Long id);

    boolean existsById(Long id);
}
