package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.PersonType;

public interface IPersonTypeService {

    List<PersonType> findAll();

    Optional<PersonType> findById(Long id);

    PersonType save(PersonType personType);

    void deleteById(Long id);

    boolean existsById(Long id);
}
