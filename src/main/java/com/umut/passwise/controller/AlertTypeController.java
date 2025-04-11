package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.AlertTypeRequestDto;
import com.umut.passwise.dto.responses.AlertTypeResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IAlertTypeService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/alert-types")
public class AlertTypeController {

    private final IAlertTypeService alertTypeService;

    @Autowired
    public AlertTypeController(IAlertTypeService alertTypeService) {
        this.alertTypeService = alertTypeService;
    }

    @GetMapping
    public ResponseEntity<List<AlertTypeResponseDto>> getAllEntities() {
        List<AlertTypeResponseDto> entities = alertTypeService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlertTypeResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<AlertTypeResponseDto> entity = alertTypeService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<AlertTypeResponseDto> createEntity(@RequestBody AlertTypeRequestDto alertTypeRequestDto) {
        AlertTypeResponseDto savedEntity = alertTypeService.save(alertTypeRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlertTypeResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody AlertTypeRequestDto alertTypeRequestDto) {
        // ID'yi kontrol et
        if (!alertTypeService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        AlertTypeResponseDto updatedEntity = alertTypeService.update(id, alertTypeRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            alertTypeService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
