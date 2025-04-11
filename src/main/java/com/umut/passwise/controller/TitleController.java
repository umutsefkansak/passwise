package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.TitleRequestDto;
import com.umut.passwise.dto.responses.TitleResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.ITitleService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/titles")
public class TitleController {

    private final ITitleService titleService;

    @Autowired
    public TitleController(ITitleService titleService) {
        this.titleService = titleService;
    }

    @GetMapping
    public ResponseEntity<List<TitleResponseDto>> getAllEntities() {
        List<TitleResponseDto> entities = titleService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TitleResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<TitleResponseDto> entity = titleService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<TitleResponseDto> createEntity(@RequestBody TitleRequestDto titleRequestDto) {
        TitleResponseDto savedEntity = titleService.save(titleRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TitleResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody TitleRequestDto titleRequestDto) {
        // ID'yi kontrol et
        if (!titleService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        TitleResponseDto updatedEntity = titleService.update(id, titleRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            titleService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
