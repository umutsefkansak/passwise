package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.DoorRequestDto;
import com.umut.passwise.dto.responses.DoorResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IDoorService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doors")
public class DoorController {

    private final IDoorService doorService;

    @Autowired
    public DoorController(IDoorService doorService) {
        this.doorService = doorService;
    }

    @GetMapping
    public ResponseEntity<List<DoorResponseDto>> getAllEntities() {
        List<DoorResponseDto> entities = doorService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoorResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<DoorResponseDto> entity = doorService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<DoorResponseDto> createEntity(@RequestBody DoorRequestDto doorRequestDto) {
        DoorResponseDto savedEntity = doorService.save(doorRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoorResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody DoorRequestDto doorRequestDto) {
        // ID'yi kontrol et
        if (!doorService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        DoorResponseDto updatedEntity = doorService.update(id, doorRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            doorService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
