package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.PersonnelBlacklistRequestDto;
import com.umut.passwise.dto.responses.PersonnelBlacklistResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IPersonnelBlacklistService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personnel-blacklists")
public class PersonnelBlacklistController {

    private final IPersonnelBlacklistService personnelBlacklistService;

    @Autowired
    public PersonnelBlacklistController(IPersonnelBlacklistService personnelBlacklistService) {
        this.personnelBlacklistService = personnelBlacklistService;
    }

    @GetMapping
    public ResponseEntity<List<PersonnelBlacklistResponseDto>> getAllEntities() {
        List<PersonnelBlacklistResponseDto> entities = personnelBlacklistService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonnelBlacklistResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<PersonnelBlacklistResponseDto> entity = personnelBlacklistService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<PersonnelBlacklistResponseDto> createEntity(@RequestBody PersonnelBlacklistRequestDto personnelBlacklistRequestDto) {
        PersonnelBlacklistResponseDto savedEntity = personnelBlacklistService.save(personnelBlacklistRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonnelBlacklistResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PersonnelBlacklistRequestDto personnelBlacklistRequestDto) {
        // ID'yi kontrol et
        if (!personnelBlacklistService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        PersonnelBlacklistResponseDto updatedEntity = personnelBlacklistService.update(id, personnelBlacklistRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            personnelBlacklistService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
