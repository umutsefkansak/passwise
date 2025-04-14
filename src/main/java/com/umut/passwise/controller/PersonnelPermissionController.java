package com.umut.passwise.controller;

import com.umut.passwise.dto.requests.BulkDoorPermissionRequestDto;
import com.umut.passwise.dto.requests.PersonnelPermissionRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionResponseDto;
import com.umut.passwise.service.abstracts.IPersonnelPermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        try {
            PersonnelPermissionResponseDto savedEntity = personnelPermissionService.grantPermission(personnelPermissionRequestDto);
            return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<PersonnelPermissionResponseDto>> createBulkPermissions(@RequestBody BulkDoorPermissionRequestDto bulkRequestDto) {
        try {
            List<PersonnelPermissionResponseDto> savedEntities = personnelPermissionService.grantBulkPermissions(bulkRequestDto);
            return new ResponseEntity<>(savedEntities, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonnelPermissionResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PersonnelPermissionRequestDto personnelPermissionRequestDto) {
        try {
            // ID'yi kontrol et
            if (!personnelPermissionService.existsById(id)) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Entity'yi güncelle
            PersonnelPermissionResponseDto updatedEntity = personnelPermissionService.update(id, personnelPermissionRequestDto);
            return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntity(@PathVariable("id") Long id) {
        try {
            personnelPermissionService.revokePermission(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<Void> deleteBulkPermissions(@RequestBody BulkDoorPermissionRequestDto bulkRequestDto) {
        try {
            personnelPermissionService.revokeBulkPermissions(bulkRequestDto);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}