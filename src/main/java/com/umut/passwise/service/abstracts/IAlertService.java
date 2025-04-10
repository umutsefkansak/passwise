package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.Alert;

public interface IAlertService {

    List<Alert> findAll();

    Optional<Alert> findById(Long id);

    Alert save(Alert alert);

    void deleteById(Long id);

    boolean existsById(Long id);
}
