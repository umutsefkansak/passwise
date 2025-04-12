package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.CardTypeRequestDto;
import com.umut.passwise.dto.responses.CardTypeResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.ICardTypeService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/card-types")
public class CardTypeController {

    private final ICardTypeService cardTypeService;

    @Autowired
    public CardTypeController(ICardTypeService cardTypeService) {
        this.cardTypeService = cardTypeService;
    }

    @GetMapping
    public ResponseEntity<List<CardTypeResponseDto>> getAllEntities() {
        List<CardTypeResponseDto> entities = cardTypeService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardTypeResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<CardTypeResponseDto> entity = cardTypeService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<CardTypeResponseDto> createEntity(@RequestBody CardTypeRequestDto cardTypeRequestDto) {
        CardTypeResponseDto savedEntity = cardTypeService.save(cardTypeRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardTypeResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody CardTypeRequestDto cardTypeRequestDto) {
        // ID'yi kontrol et
        if (!cardTypeService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        CardTypeResponseDto updatedEntity = cardTypeService.update(id, cardTypeRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            cardTypeService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
