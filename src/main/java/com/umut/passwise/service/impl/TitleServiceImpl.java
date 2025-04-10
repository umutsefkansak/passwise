package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.Title;
import com.umut.passwise.repository.TitleRepository;
import com.umut.passwise.service.abstracts.ITitleService;

import java.util.List;
import java.util.Optional;

@Service
public class TitleServiceImpl implements ITitleService {

    private final TitleRepository titleRepository;

    @Autowired
    public TitleServiceImpl(TitleRepository titleRepository) {
        this.titleRepository = titleRepository;
    }

    @Override
    public List<Title> findAll() {
        return titleRepository.findAll();
    }

    @Override
    public Optional<Title> findById(Long id) {
        return titleRepository.findById(id);
    }

    @Override
    public Title save(Title title) {
        return titleRepository.save(title);
    }

    @Override
    public void deleteById(Long id) {
        titleRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return titleRepository.existsById(id);
    }
}
