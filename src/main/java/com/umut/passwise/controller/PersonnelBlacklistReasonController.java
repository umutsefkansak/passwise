package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.PersonnelBlacklistReasonRequestDto;
import com.umut.passwise.dto.responses.PersonnelBlacklistReasonResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IPersonnelBlacklistReasonService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personnel-blacklist-reasons")
public class PersonnelBlacklistReasonController {

    private final IPersonnelBlacklistReasonService personnelBlacklistReasonService;

    @Autowired
    public PersonnelBlacklistReasonController(IPersonnelBlacklistReasonService personnelBlacklistReasonService) {
        this.personnelBlacklistReasonService = personnelBlacklistReasonService;
    }

    @GetMapping
    public ResponseEntity<List<PersonnelBlacklistReasonResponseDto>> getAllEntities() {
        List<PersonnelBlacklistReasonResponseDto> entities = personnelBlacklistReasonService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonnelBlacklistReasonResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<PersonnelBlacklistReasonResponseDto> entity = personnelBlacklistReasonService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<PersonnelBlacklistReasonResponseDto> createEntity(@RequestBody PersonnelBlacklistReasonRequestDto personnelBlacklistReasonRequestDto) {
        PersonnelBlacklistReasonResponseDto savedEntity = personnelBlacklistReasonService.save(personnelBlacklistReasonRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonnelBlacklistReasonResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PersonnelBlacklistReasonRequestDto personnelBlacklistReasonRequestDto) {
        // ID'yi kontrol et
        if (!personnelBlacklistReasonService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        PersonnelBlacklistReasonResponseDto updatedEntity = personnelBlacklistReasonService.update(id, personnelBlacklistReasonRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            personnelBlacklistReasonService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
