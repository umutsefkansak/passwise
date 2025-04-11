package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.PersonTypeRequestDto;
import com.umut.passwise.dto.responses.PersonTypeResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IPersonTypeService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/person-types")
public class PersonTypeController {

    private final IPersonTypeService personTypeService;

    @Autowired
    public PersonTypeController(IPersonTypeService personTypeService) {
        this.personTypeService = personTypeService;
    }

    @GetMapping
    public ResponseEntity<List<PersonTypeResponseDto>> getAllEntities() {
        List<PersonTypeResponseDto> entities = personTypeService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonTypeResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<PersonTypeResponseDto> entity = personTypeService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<PersonTypeResponseDto> createEntity(@RequestBody PersonTypeRequestDto personTypeRequestDto) {
        PersonTypeResponseDto savedEntity = personTypeService.save(personTypeRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonTypeResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PersonTypeRequestDto personTypeRequestDto) {
        // ID'yi kontrol et
        if (!personTypeService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        PersonTypeResponseDto updatedEntity = personTypeService.update(id, personTypeRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            personTypeService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
