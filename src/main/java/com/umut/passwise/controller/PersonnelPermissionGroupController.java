package com.umut.passwise.controller;

import com.umut.passwise.dto.requests.BulkPermissionGroupRequestDto;
import com.umut.passwise.dto.requests.PersonnelPermissionGroupRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionGroupResponseDto;
import com.umut.passwise.service.abstracts.IPersonnelPermissionGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<PersonnelPermissionGroupResponseDto> createEntity(@RequestBody PersonnelPermissionGroupRequestDto requestDto) {
        try {
            PersonnelPermissionGroupResponseDto savedEntity = personnelPermissionGroupService.grantPermissionGroup(requestDto);
            return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<PersonnelPermissionGroupResponseDto>> createBulkPermissionGroups(@RequestBody BulkPermissionGroupRequestDto bulkRequestDto) {
        try {
            List<PersonnelPermissionGroupResponseDto> savedEntities = personnelPermissionGroupService.grantBulkPermissionGroups(bulkRequestDto);
            return new ResponseEntity<>(savedEntities, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonnelPermissionGroupResponseDto> updateEntity(
            @PathVariable("id") Long id,
            @RequestBody PersonnelPermissionGroupRequestDto requestDto) {
        try {
            // ID'yi kontrol et
            if (!personnelPermissionGroupService.existsById(id)) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Entity'yi güncelle
            PersonnelPermissionGroupResponseDto updatedEntity = personnelPermissionGroupService.update(id, requestDto);
            return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntity(@PathVariable("id") Long id) {
        try {
            personnelPermissionGroupService.revokePermissionGroup(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<Void> deleteBulkPermissionGroups(@RequestBody BulkPermissionGroupRequestDto bulkRequestDto) {
        try {
            personnelPermissionGroupService.revokeBulkPermissionGroups(bulkRequestDto);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}