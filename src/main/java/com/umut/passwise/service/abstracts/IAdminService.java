package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.Admin;

public interface IAdminService {

    List<Admin> findAll();

    Optional<Admin> findById(Long id);

    Admin save(Admin admin);

    void deleteById(Long id);

    boolean existsById(Long id);
}
