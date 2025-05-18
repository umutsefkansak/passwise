package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.CardRequestDto;
import com.umut.passwise.dto.responses.CardResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.ICardService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final ICardService cardService;

    @Autowired
    public CardController(ICardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping
    public ResponseEntity<List<CardResponseDto>> getAllEntities() {
        List<CardResponseDto> entities = cardService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<CardResponseDto> entity = cardService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<CardResponseDto> createEntity(@RequestBody CardRequestDto cardRequestDto) {
        CardResponseDto savedEntity = cardService.save(cardRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody CardRequestDto cardRequestDto) {
        // ID'yi kontrol et
        if (!cardService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        CardResponseDto updatedEntity = cardService.update(id, cardRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        System.out.println("GElen id:"+id);
        try {
            cardService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
