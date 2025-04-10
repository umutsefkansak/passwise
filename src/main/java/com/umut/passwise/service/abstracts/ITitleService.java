package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.Title;

public interface ITitleService {

    List<Title> findAll();

    Optional<Title> findById(Long id);

    Title save(Title title);

    void deleteById(Long id);

    boolean existsById(Long id);
}
