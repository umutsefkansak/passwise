package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.PersonnelBlacklist;

public interface IPersonnelBlacklistService {

    List<PersonnelBlacklist> findAll();

    Optional<PersonnelBlacklist> findById(Long id);

    PersonnelBlacklist save(PersonnelBlacklist personnelBlacklist);

    void deleteById(Long id);

    boolean existsById(Long id);
}
