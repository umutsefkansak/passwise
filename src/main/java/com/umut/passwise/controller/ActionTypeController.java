package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.ActionTypeRequestDto;
import com.umut.passwise.dto.responses.ActionTypeResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IActionTypeService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/action-types")
public class ActionTypeController {

    private final IActionTypeService actionTypeService;

    @Autowired
    public ActionTypeController(IActionTypeService actionTypeService) {
        this.actionTypeService = actionTypeService;
    }

    @GetMapping
    public ResponseEntity<List<ActionTypeResponseDto>> getAllEntities() {
        List<ActionTypeResponseDto> entities = actionTypeService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActionTypeResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<ActionTypeResponseDto> entity = actionTypeService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<ActionTypeResponseDto> createEntity(@RequestBody ActionTypeRequestDto actionTypeRequestDto) {
        ActionTypeResponseDto savedEntity = actionTypeService.save(actionTypeRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActionTypeResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody ActionTypeRequestDto actionTypeRequestDto) {
        // ID'yi kontrol et
        if (!actionTypeService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        ActionTypeResponseDto updatedEntity = actionTypeService.update(id, actionTypeRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            actionTypeService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
