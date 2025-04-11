package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.PersonnelPermissionRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IPersonnelPermissionService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personnel-permissions")
public class PersonnelPermissionController {

    private final IPersonnelPermissionService personnelPermissionService;

    @Autowired
    public PersonnelPermissionController(IPersonnelPermissionService personnelPermissionService) {
        this.personnelPermissionService = personnelPermissionService;
    }

    @GetMapping
    public ResponseEntity<List<PersonnelPermissionResponseDto>> getAllEntities() {
        List<PersonnelPermissionResponseDto> entities = personnelPermissionService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonnelPermissionResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<PersonnelPermissionResponseDto> entity = personnelPermissionService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<PersonnelPermissionResponseDto> createEntity(@RequestBody PersonnelPermissionRequestDto personnelPermissionRequestDto) {
        PersonnelPermissionResponseDto savedEntity = personnelPermissionService.save(personnelPermissionRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonnelPermissionResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PersonnelPermissionRequestDto personnelPermissionRequestDto) {
        // ID'yi kontrol et
        if (!personnelPermissionService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        PersonnelPermissionResponseDto updatedEntity = personnelPermissionService.update(id, personnelPermissionRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            personnelPermissionService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
