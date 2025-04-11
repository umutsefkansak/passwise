package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.PersonnelPermissionGroupRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionGroupResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IPersonnelPermissionGroupService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personnel-permission-groups")
public class PersonnelPermissionGroupController {

    private final IPersonnelPermissionGroupService personnelPermissionGroupService;

    @Autowired
    public PersonnelPermissionGroupController(IPersonnelPermissionGroupService personnelPermissionGroupService) {
        this.personnelPermissionGroupService = personnelPermissionGroupService;
    }

    @GetMapping
    public ResponseEntity<List<PersonnelPermissionGroupResponseDto>> getAllEntities() {
        List<PersonnelPermissionGroupResponseDto> entities = personnelPermissionGroupService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonnelPermissionGroupResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<PersonnelPermissionGroupResponseDto> entity = personnelPermissionGroupService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<PersonnelPermissionGroupResponseDto> createEntity(@RequestBody PersonnelPermissionGroupRequestDto personnelPermissionGroupRequestDto) {
        PersonnelPermissionGroupResponseDto savedEntity = personnelPermissionGroupService.save(personnelPermissionGroupRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonnelPermissionGroupResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PersonnelPermissionGroupRequestDto personnelPermissionGroupRequestDto) {
        // ID'yi kontrol et
        if (!personnelPermissionGroupService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        PersonnelPermissionGroupResponseDto updatedEntity = personnelPermissionGroupService.update(id, personnelPermissionGroupRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            personnelPermissionGroupService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
