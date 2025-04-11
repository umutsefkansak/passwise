package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.QrCodeRequestDto;
import com.umut.passwise.dto.responses.QrCodeResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IQrCodeService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/qr-codes")
public class QrCodeController {

    private final IQrCodeService qrCodeService;

    @Autowired
    public QrCodeController(IQrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    @GetMapping
    public ResponseEntity<List<QrCodeResponseDto>> getAllEntities() {
        List<QrCodeResponseDto> entities = qrCodeService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QrCodeResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<QrCodeResponseDto> entity = qrCodeService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<QrCodeResponseDto> createEntity(@RequestBody QrCodeRequestDto qrCodeRequestDto) {
        QrCodeResponseDto savedEntity = qrCodeService.save(qrCodeRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QrCodeResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody QrCodeRequestDto qrCodeRequestDto) {
        // ID'yi kontrol et
        if (!qrCodeService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        QrCodeResponseDto updatedEntity = qrCodeService.update(id, qrCodeRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            qrCodeService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
