package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.FormerPersonnelRequestDto;
import com.umut.passwise.dto.responses.FormerPersonnelResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IFormerPersonnelService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/former-personnels")
public class FormerPersonnelController {

    private final IFormerPersonnelService formerPersonnelService;

    @Autowired
    public FormerPersonnelController(IFormerPersonnelService formerPersonnelService) {
        this.formerPersonnelService = formerPersonnelService;
    }

    @GetMapping
    public ResponseEntity<List<FormerPersonnelResponseDto>> getAllEntities() {
        List<FormerPersonnelResponseDto> entities = formerPersonnelService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormerPersonnelResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<FormerPersonnelResponseDto> entity = formerPersonnelService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<FormerPersonnelResponseDto> createEntity(@RequestBody FormerPersonnelRequestDto formerPersonnelRequestDto) {
        FormerPersonnelResponseDto savedEntity = formerPersonnelService.save(formerPersonnelRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormerPersonnelResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody FormerPersonnelRequestDto formerPersonnelRequestDto) {
        // ID'yi kontrol et
        if (!formerPersonnelService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        FormerPersonnelResponseDto updatedEntity = formerPersonnelService.update(id, formerPersonnelRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            formerPersonnelService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
