package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.DoorTypeRequestDto;
import com.umut.passwise.dto.responses.DoorTypeResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IDoorTypeService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/door-types")
public class DoorTypeController {

    private final IDoorTypeService doorTypeService;

    @Autowired
    public DoorTypeController(IDoorTypeService doorTypeService) {
        this.doorTypeService = doorTypeService;
    }

    @GetMapping
    public ResponseEntity<List<DoorTypeResponseDto>> getAllEntities() {
        List<DoorTypeResponseDto> entities = doorTypeService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoorTypeResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<DoorTypeResponseDto> entity = doorTypeService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<DoorTypeResponseDto> createEntity(@RequestBody DoorTypeRequestDto doorTypeRequestDto) {
        DoorTypeResponseDto savedEntity = doorTypeService.save(doorTypeRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoorTypeResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody DoorTypeRequestDto doorTypeRequestDto) {
        // ID'yi kontrol et
        if (!doorTypeService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        DoorTypeResponseDto updatedEntity = doorTypeService.update(id, doorTypeRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            doorTypeService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
