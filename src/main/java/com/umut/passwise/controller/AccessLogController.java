package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.AccessLogRequestDto;
import com.umut.passwise.dto.responses.AccessLogResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IAccessLogService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/access-logs")
public class AccessLogController {

    private final IAccessLogService accessLogService;

    @Autowired
    public AccessLogController(IAccessLogService accessLogService) {
        this.accessLogService = accessLogService;
    }

    @GetMapping
    public ResponseEntity<List<AccessLogResponseDto>> getAllEntities() {
        List<AccessLogResponseDto> entities = accessLogService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccessLogResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<AccessLogResponseDto> entity = accessLogService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<AccessLogResponseDto> createEntity(@RequestBody AccessLogRequestDto accessLogRequestDto) {
        AccessLogResponseDto savedEntity = accessLogService.save(accessLogRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccessLogResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody AccessLogRequestDto accessLogRequestDto) {
        // ID'yi kontrol et
        if (!accessLogService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        AccessLogResponseDto updatedEntity = accessLogService.update(id, accessLogRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            accessLogService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
