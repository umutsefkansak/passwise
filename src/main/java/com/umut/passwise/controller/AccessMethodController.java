package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.AccessMethodRequestDto;
import com.umut.passwise.dto.responses.AccessMethodResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IAccessMethodService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/access-methods")
public class AccessMethodController {

    private final IAccessMethodService accessMethodService;

    @Autowired
    public AccessMethodController(IAccessMethodService accessMethodService) {
        this.accessMethodService = accessMethodService;
    }

    @GetMapping
    public ResponseEntity<List<AccessMethodResponseDto>> getAllEntities() {
        List<AccessMethodResponseDto> entities = accessMethodService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccessMethodResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<AccessMethodResponseDto> entity = accessMethodService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<AccessMethodResponseDto> createEntity(@RequestBody AccessMethodRequestDto accessMethodRequestDto) {
        AccessMethodResponseDto savedEntity = accessMethodService.save(accessMethodRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccessMethodResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody AccessMethodRequestDto accessMethodRequestDto) {
        // ID'yi kontrol et
        if (!accessMethodService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        AccessMethodResponseDto updatedEntity = accessMethodService.update(id, accessMethodRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            accessMethodService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
