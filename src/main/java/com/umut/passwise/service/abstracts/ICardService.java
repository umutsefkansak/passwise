package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.Card;

public interface ICardService {

    List<Card> findAll();

    Optional<Card> findById(Long id);

    Card save(Card card);

    void deleteById(Long id);

    boolean existsById(Long id);
}
