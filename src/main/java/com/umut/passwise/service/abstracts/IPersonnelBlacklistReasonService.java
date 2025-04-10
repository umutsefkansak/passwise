package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.PersonnelBlacklistReason;

public interface IPersonnelBlacklistReasonService {

    List<PersonnelBlacklistReason> findAll();

    Optional<PersonnelBlacklistReason> findById(Long id);

    PersonnelBlacklistReason save(PersonnelBlacklistReason personnelBlacklistReason);

    void deleteById(Long id);

    boolean existsById(Long id);
}
