package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.CardBlacklistReasonRequestDto;
import com.umut.passwise.dto.responses.CardBlacklistReasonResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.ICardBlacklistReasonService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/card-blacklist-reasons")
public class CardBlacklistReasonController {

    private final ICardBlacklistReasonService cardBlacklistReasonService;

    @Autowired
    public CardBlacklistReasonController(ICardBlacklistReasonService cardBlacklistReasonService) {
        this.cardBlacklistReasonService = cardBlacklistReasonService;
    }

    @GetMapping
    public ResponseEntity<List<CardBlacklistReasonResponseDto>> getAllEntities() {
        List<CardBlacklistReasonResponseDto> entities = cardBlacklistReasonService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardBlacklistReasonResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<CardBlacklistReasonResponseDto> entity = cardBlacklistReasonService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<CardBlacklistReasonResponseDto> createEntity(@RequestBody CardBlacklistReasonRequestDto cardBlacklistReasonRequestDto) {
        CardBlacklistReasonResponseDto savedEntity = cardBlacklistReasonService.save(cardBlacklistReasonRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardBlacklistReasonResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody CardBlacklistReasonRequestDto cardBlacklistReasonRequestDto) {
        // ID'yi kontrol et
        if (!cardBlacklistReasonService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        CardBlacklistReasonResponseDto updatedEntity = cardBlacklistReasonService.update(id, cardBlacklistReasonRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            cardBlacklistReasonService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
