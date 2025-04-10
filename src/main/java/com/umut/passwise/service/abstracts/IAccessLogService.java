package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.AccessLog;

public interface IAccessLogService {

    List<AccessLog> findAll();

    Optional<AccessLog> findById(Long id);

    AccessLog save(AccessLog accessLog);

    void deleteById(Long id);

    boolean existsById(Long id);
}
