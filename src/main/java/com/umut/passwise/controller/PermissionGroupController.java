package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.PermissionGroupRequestDto;
import com.umut.passwise.dto.responses.PermissionGroupResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IPermissionGroupService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/permission-groups")
public class PermissionGroupController {

    private final IPermissionGroupService permissionGroupService;

    @Autowired
    public PermissionGroupController(IPermissionGroupService permissionGroupService) {
        this.permissionGroupService = permissionGroupService;
    }

    @GetMapping
    public ResponseEntity<List<PermissionGroupResponseDto>> getAllEntities() {
        List<PermissionGroupResponseDto> entities = permissionGroupService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PermissionGroupResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<PermissionGroupResponseDto> entity = permissionGroupService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<PermissionGroupResponseDto> createEntity(@RequestBody PermissionGroupRequestDto permissionGroupRequestDto) {
        PermissionGroupResponseDto savedEntity = permissionGroupService.save(permissionGroupRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PermissionGroupResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PermissionGroupRequestDto permissionGroupRequestDto) {
        // ID'yi kontrol et
        if (!permissionGroupService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        PermissionGroupResponseDto updatedEntity = permissionGroupService.update(id, permissionGroupRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            permissionGroupService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
