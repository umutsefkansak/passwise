package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.CardBlacklistRequestDto;
import com.umut.passwise.dto.responses.CardBlacklistResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.ICardBlacklistService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/card-blacklists")
public class CardBlacklistController {

    private final ICardBlacklistService cardBlacklistService;

    @Autowired
    public CardBlacklistController(ICardBlacklistService cardBlacklistService) {
        this.cardBlacklistService = cardBlacklistService;
    }

    @GetMapping
    public ResponseEntity<List<CardBlacklistResponseDto>> getAllEntities() {
        List<CardBlacklistResponseDto> entities = cardBlacklistService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardBlacklistResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<CardBlacklistResponseDto> entity = cardBlacklistService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<CardBlacklistResponseDto> createEntity(@RequestBody CardBlacklistRequestDto cardBlacklistRequestDto) {
        CardBlacklistResponseDto savedEntity = cardBlacklistService.save(cardBlacklistRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardBlacklistResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody CardBlacklistRequestDto cardBlacklistRequestDto) {
        // ID'yi kontrol et
        if (!cardBlacklistService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        CardBlacklistResponseDto updatedEntity = cardBlacklistService.update(id, cardBlacklistRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            cardBlacklistService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
