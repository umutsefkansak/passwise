package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.AccessResultRequestDto;
import com.umut.passwise.dto.responses.AccessResultResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IAccessResultService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/access-results")
public class AccessResultController {

    private final IAccessResultService accessResultService;

    @Autowired
    public AccessResultController(IAccessResultService accessResultService) {
        this.accessResultService = accessResultService;
    }

    @GetMapping
    public ResponseEntity<List<AccessResultResponseDto>> getAllEntities() {
        List<AccessResultResponseDto> entities = accessResultService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccessResultResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<AccessResultResponseDto> entity = accessResultService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<AccessResultResponseDto> createEntity(@RequestBody AccessResultRequestDto accessResultRequestDto) {
        AccessResultResponseDto savedEntity = accessResultService.save(accessResultRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccessResultResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody AccessResultRequestDto accessResultRequestDto) {
        // ID'yi kontrol et
        if (!accessResultService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        AccessResultResponseDto updatedEntity = accessResultService.update(id, accessResultRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            accessResultService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
