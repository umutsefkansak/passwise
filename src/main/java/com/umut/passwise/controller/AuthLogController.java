package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.AuthLogRequestDto;
import com.umut.passwise.dto.responses.AuthLogResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IAuthLogService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth-logs")
public class AuthLogController {

    private final IAuthLogService authLogService;

    @Autowired
    public AuthLogController(IAuthLogService authLogService) {
        this.authLogService = authLogService;
    }

    @GetMapping
    public ResponseEntity<List<AuthLogResponseDto>> getAllEntities() {
        List<AuthLogResponseDto> entities = authLogService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthLogResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<AuthLogResponseDto> entity = authLogService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<AuthLogResponseDto> createEntity(@RequestBody AuthLogRequestDto authLogRequestDto) {
        AuthLogResponseDto savedEntity = authLogService.save(authLogRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthLogResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody AuthLogRequestDto authLogRequestDto) {
        // ID'yi kontrol et
        if (!authLogService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        AuthLogResponseDto updatedEntity = authLogService.update(id, authLogRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            authLogService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
