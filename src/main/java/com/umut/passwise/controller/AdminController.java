package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.AdminRequestDto;
import com.umut.passwise.dto.responses.AdminResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IAdminService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    private final IAdminService adminService;

    @Autowired
    public AdminController(IAdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<List<AdminResponseDto>> getAllEntities() {
        List<AdminResponseDto> entities = adminService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<AdminResponseDto> entity = adminService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<AdminResponseDto> createEntity(@RequestBody AdminRequestDto adminRequestDto) {
        AdminResponseDto savedEntity = adminService.save(adminRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody AdminRequestDto adminRequestDto) {
        // ID'yi kontrol et
        if (!adminService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }



        // Entity'yi bul ve güncelle
        AdminResponseDto updatedEntity = adminService.update(id, adminRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            adminService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @GetMapping("/by-username/{username}")
    public ResponseEntity<AdminResponseDto> getEntityByUsername(@PathVariable("username") String username) {
        Optional<AdminResponseDto> entity = adminService.findByUsername(username);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }


}
