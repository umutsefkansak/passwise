package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.PersonnelRequestDto;
import com.umut.passwise.dto.responses.PersonnelResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IPersonnelService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personnels")
public class PersonnelController {

    private final IPersonnelService personnelService;

    @Autowired
    public PersonnelController(IPersonnelService personnelService) {
        this.personnelService = personnelService;
    }

    @GetMapping
    public ResponseEntity<List<PersonnelResponseDto>> getAllEntities() {
        List<PersonnelResponseDto> entities = personnelService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonnelResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<PersonnelResponseDto> entity = personnelService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<PersonnelResponseDto> createEntity(@RequestBody PersonnelRequestDto personnelRequestDto) {
        PersonnelResponseDto savedEntity = personnelService.save(personnelRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonnelResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PersonnelRequestDto personnelRequestDto) {
        // ID'yi kontrol et
        if (!personnelService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        PersonnelResponseDto updatedEntity = personnelService.update(id, personnelRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            personnelService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
