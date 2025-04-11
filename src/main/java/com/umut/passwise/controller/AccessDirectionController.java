package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.AccessDirectionRequestDto;
import com.umut.passwise.dto.responses.AccessDirectionResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IAccessDirectionService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/access-directions")
public class AccessDirectionController {

    private final IAccessDirectionService accessDirectionService;

    @Autowired
    public AccessDirectionController(IAccessDirectionService accessDirectionService) {
        this.accessDirectionService = accessDirectionService;
    }

    @GetMapping
    public ResponseEntity<List<AccessDirectionResponseDto>> getAllEntities() {
        List<AccessDirectionResponseDto> entities = accessDirectionService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccessDirectionResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<AccessDirectionResponseDto> entity = accessDirectionService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<AccessDirectionResponseDto> createEntity(@RequestBody AccessDirectionRequestDto accessDirectionRequestDto) {
        AccessDirectionResponseDto savedEntity = accessDirectionService.save(accessDirectionRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccessDirectionResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody AccessDirectionRequestDto accessDirectionRequestDto) {
        // ID'yi kontrol et
        if (!accessDirectionService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        AccessDirectionResponseDto updatedEntity = accessDirectionService.update(id, accessDirectionRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            accessDirectionService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
