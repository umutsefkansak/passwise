package com.umut.passwise.controller;

import com.umut.passwise.dto.requests.PersonnelRequestDto;
import com.umut.passwise.dto.responses.PersonnelResponseDto;
import com.umut.passwise.service.abstracts.IFileStorageService;
import com.umut.passwise.service.abstracts.IPersonnelService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personnels")
public class PersonnelController {

    private final IPersonnelService personnelService;
    private final IFileStorageService fileStorageService;

    @Autowired
    public PersonnelController(IPersonnelService personnelService, IFileStorageService fileStorageService) {
        this.personnelService = personnelService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public ResponseEntity<List<PersonnelResponseDto>> getAllEntities() {
        List<PersonnelResponseDto> entities = personnelService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/is-active-true")
    public ResponseEntity<List<PersonnelResponseDto>> getIsActiveTrueEntities() {
        List<PersonnelResponseDto> entities = personnelService.findAllByIsActiveTrue();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/is-active-false")
    public ResponseEntity<List<PersonnelResponseDto>> getIsActiveFalseEntities() {
        List<PersonnelResponseDto> entities = personnelService.findAllByIsActiveFalse();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonnelResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<PersonnelResponseDto> entity = personnelService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<PersonnelResponseDto> createEntity(@RequestBody PersonnelRequestDto personnelRequestDto) {
        PersonnelResponseDto savedEntity = personnelService.save(personnelRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonnelResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PersonnelRequestDto personnelRequestDto) {
        // ID'yi kontrol et
        if (!personnelService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        PersonnelResponseDto updatedEntity = personnelService.update(id, personnelRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            personnelService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Fotoğraf yükleme endpoint'i
    @PostMapping("/{id}/photo")
    public ResponseEntity<?> uploadPhoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return new ResponseEntity<>("Lütfen bir dosya seçin.", HttpStatus.BAD_REQUEST);
            }

            // Dosya uzantısını kontrol et (sadece resim dosyaları kabul edilmeli)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return new ResponseEntity<>("Sadece resim dosyaları yüklenebilir.", HttpStatus.BAD_REQUEST);
            }

            // Fotoğrafı yükle
            String fileName = personnelService.uploadPhoto(id, file);

            return ResponseEntity.ok().body("Fotoğraf başarıyla yüklendi: " + fileName);
        } catch (Exception e) {
            return new ResponseEntity<>("Fotoğraf yüklenemedi: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Fotoğraf görüntüleme endpoint'i
    @GetMapping("/{id}/photo")
    public ResponseEntity<?> getPhoto(@PathVariable Long id) {
        try {
            Optional<PersonnelResponseDto> personnelOpt = personnelService.findById(id);

            if (!personnelOpt.isPresent()) {
                return new ResponseEntity<>("Personel bulunamadı.", HttpStatus.NOT_FOUND);
            }

            PersonnelResponseDto personnel = personnelOpt.get();

            if (personnel.getPhotoFileName() == null) {
                return new ResponseEntity<>("Personel fotoğrafı bulunamadı.", HttpStatus.NOT_FOUND);
            }

            // Fotoğraf dosyasının yolunu al
            Path photoPath = fileStorageService.getPersonnelPhotoPath(personnel.getPhotoFileName());
            Resource resource = new UrlResource(photoPath.toUri());

            if (!resource.exists()) {
                return new ResponseEntity<>("Fotoğraf dosyası bulunamadı.", HttpStatus.NOT_FOUND);
            }

            // Resim tipini belirleme
            String contentType = determineContentType(personnel.getPhotoFileName());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (Exception e) {
            return new ResponseEntity<>("Fotoğraf yüklenemedi: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @DeleteMapping("/{id}/photo")
    public ResponseEntity<?> deletePhoto(@PathVariable Long id) {
        try {
            // Personel var mı kontrol et
            if (!personnelService.existsById(id)) {
                return new ResponseEntity<>("Personel bulunamadı.", HttpStatus.NOT_FOUND);
            }

            // Fotoğrafı sil
            personnelService.deletePhoto(id);

            return ResponseEntity.ok("Fotoğraf başarıyla silindi.");
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (IOException e) {
            return new ResponseEntity<>("Fotoğraf silinirken bir hata oluştu: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Dosya tipini belirleme yardımcı metodu
    private String determineContentType(String fileName) {
        if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (fileName.toLowerCase().endsWith(".png")) {
            return "image/png";
        } else if (fileName.toLowerCase().endsWith(".gif")) {
            return "image/gif";
        } else {
            return "application/octet-stream";
        }
    }
}
/*package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.PersonnelRequestDto;
import com.umut.passwise.dto.responses.PersonnelResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IPersonnelService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personnels")
public class PersonnelController {

    private final IPersonnelService personnelService;

    @Autowired
    public PersonnelController(IPersonnelService personnelService) {
        this.personnelService = personnelService;
    }

    @GetMapping
    public ResponseEntity<List<PersonnelResponseDto>> getAllEntities() {
        List<PersonnelResponseDto> entities = personnelService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonnelResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<PersonnelResponseDto> entity = personnelService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<PersonnelResponseDto> createEntity(@RequestBody PersonnelRequestDto personnelRequestDto) {
        PersonnelResponseDto savedEntity = personnelService.save(personnelRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonnelResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PersonnelRequestDto personnelRequestDto) {
        // ID'yi kontrol et
        if (!personnelService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        PersonnelResponseDto updatedEntity = personnelService.update(id, personnelRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            personnelService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}*/
