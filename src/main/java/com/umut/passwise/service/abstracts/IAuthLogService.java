package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.AuthLog;

public interface IAuthLogService {

    List<AuthLog> findAll();

    Optional<AuthLog> findById(Long id);

    AuthLog save(AuthLog authLog);

    void deleteById(Long id);

    boolean existsById(Long id);
}
