package com.umut.passwise.controller;

import com.umut.passwise.dto.requests.BulkDoorPermissionRequestDto;
import com.umut.passwise.dto.requests.BulkPermissionGroupRequestDto;
import com.umut.passwise.dto.requests.PersonnelPermissionRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionResponseDto;
import com.umut.passwise.entities.*;
import com.umut.passwise.repository.*;
import com.umut.passwise.service.abstracts.IAuthLogService;
import com.umut.passwise.service.abstracts.IPersonnelPermissionGroupService;
import com.umut.passwise.service.abstracts.IPersonnelPermissionService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personnel-permissions")
public class PersonnelPermissionController {

    private final IPersonnelPermissionService personnelPermissionService;
    private final IAuthLogService authLogService;
    private final PersonnelRepository personnelRepository;
    private final DoorRepository doorRepository;
    private final AdminRepository adminRepository;

    private final IPersonnelPermissionGroupService personnelPermissionGroupService;

    private final PersonnelPermissionRepository personnelPermissionRepository;

    private final PermissionGroupRepository permissionGroupRepository;

    @Autowired
    public PersonnelPermissionController(
            IPersonnelPermissionService personnelPermissionService,
            IAuthLogService authLogService,
            PersonnelRepository personnelRepository,
            DoorRepository doorRepository,
            AdminRepository adminRepository, IPersonnelPermissionGroupService personnelPermissionGroupService, PersonnelPermissionRepository personnelPermissionRepository, PermissionGroupRepository permissionGroupRepository
    ) {
        this.personnelPermissionService = personnelPermissionService;
        this.authLogService = authLogService;
        this.personnelRepository = personnelRepository;
        this.doorRepository = doorRepository;
        this.adminRepository = adminRepository;
        this.personnelPermissionGroupService = personnelPermissionGroupService;
        this.personnelPermissionRepository = personnelPermissionRepository;
        this.permissionGroupRepository = permissionGroupRepository;
    }

    @GetMapping
    public ResponseEntity<List<PersonnelPermissionResponseDto>> getAllEntities() {
        List<PersonnelPermissionResponseDto> entities = personnelPermissionService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonnelPermissionResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<PersonnelPermissionResponseDto> entity = personnelPermissionService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<PersonnelPermissionResponseDto> createEntity(@RequestBody PersonnelPermissionRequestDto personnelPermissionRequestDto) {
        PersonnelPermissionResponseDto savedEntity = personnelPermissionService.save(personnelPermissionRequestDto);

        // Log oluştur
        authLogService.logDoorPermissionGrant(
                personnelPermissionRequestDto.getAdmin(),
                personnelPermissionRequestDto.getPersonnel(),
                personnelPermissionRequestDto.getDoor()
        );

        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<PersonnelPermissionResponseDto>> createBulkPermissions(@RequestBody BulkDoorPermissionRequestDto bulkRequestDto) {

        Personnel personnel = personnelRepository.findById(bulkRequestDto.getPersonnelId())
                .orElseThrow(() -> new EntityNotFoundException("Personnel not found with id: " + bulkRequestDto.getPersonnelId()));

        Admin admin = adminRepository.findById(bulkRequestDto.getAdminId())
                .orElseThrow(() -> new EntityNotFoundException("Admin not found with id: " + bulkRequestDto.getAdminId()));

        List<Door> doors = doorRepository.findAllById(bulkRequestDto.getDoorIds());

        if (doors.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        List<PersonnelPermissionResponseDto> savedEntities = new ArrayList<>();

        for (Door door : doors) {
            // Eğer bu personel-kapı ilişkisi zaten varsa atla
            if (personnelPermissionService.existsByPersonnelAndDoor(personnel, door)) {
                continue;
            }

            PersonnelPermissionRequestDto requestDto = new PersonnelPermissionRequestDto();
            requestDto.setPersonnel(personnel);
            requestDto.setDoor(door);
            requestDto.setAdmin(admin);

            PersonnelPermissionResponseDto savedEntity = personnelPermissionService.save(requestDto);
            savedEntities.add(savedEntity);
        }

        // Bir kerede toplu log ekle
        if (!doors.isEmpty()) {
            authLogService.logBulkDoorPermissionGrant(admin, personnel, doors);
        }

        return new ResponseEntity<>(savedEntities, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonnelPermissionResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PersonnelPermissionRequestDto personnelPermissionRequestDto) {
        // ID'yi kontrol et
        if (!personnelPermissionService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        PersonnelPermissionResponseDto updatedEntity = personnelPermissionService.update(id, personnelPermissionRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntity(@PathVariable("id") Long id) {
        try {
            // Silinecek iznin verilerini alalım
            Optional<PersonnelPermissionResponseDto> permissionOpt = personnelPermissionService.findById(id);

            if (permissionOpt.isPresent()) {
                PersonnelPermissionResponseDto permission = permissionOpt.get();

                // Log oluşturmak için gerekli verileri alıyoruz
                Admin admin = adminRepository.findById(permission.getAdmin().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Admin not found"));

                Personnel personnel = personnelRepository.findById(permission.getPersonnel().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Personnel not found"));

                Door door = doorRepository.findById(permission.getDoor().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Door not found"));

                // İzni siliyoruz
                personnelPermissionService.deleteById(id);

                // Silme işlemini logluyoruz
                authLogService.logDoorPermissionRevoke(admin, personnel, door);

                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/bulk")
    @Transactional
    public ResponseEntity<Void> deleteBulkPermissions(@RequestBody BulkDoorPermissionRequestDto bulkRequestDto) {
        try {
            System.out.println("-------------------------------------1----------------------------------");

            Personnel personnel = personnelRepository.findById(bulkRequestDto.getPersonnelId())
                    .orElseThrow(() -> new EntityNotFoundException("Personnel not found with id: " + bulkRequestDto.getPersonnelId()));
            System.out.println("-------------------------------------2----------------------------------");

            Admin admin = adminRepository.findById(bulkRequestDto.getAdminId())
                    .orElseThrow(() -> new EntityNotFoundException("Admin not found with id: " + bulkRequestDto.getAdminId()));
            System.out.println("-------------------------------------3----------------------------------");

            List<Door> doors = doorRepository.findAllById(bulkRequestDto.getDoorIds());
            System.out.println("-------------------------------------4----------------------------------");

            if (doors.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            // Her bir kapı yetkisini kaldır
            for (Door door : doors) {
                personnelPermissionService.deleteByPersonnelAndDoor(personnel, door);
            }

            // Toplu log kaydı oluştur (yeni metod kullanılarak)
            authLogService.logBulkDoorPermissionRevoke(admin, personnel, doors);

            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            e.printStackTrace(); // Hatayı konsola yazdır
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}


/*package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.DoorRequestDto;
import com.umut.passwise.dto.requests.PersonnelPermissionRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionResponseDto;
import com.umut.passwise.entities.Door;
import com.umut.passwise.entities.Personnel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IPersonnelPermissionService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personnel-permissions")
public class PersonnelPermissionController {

    private final IPersonnelPermissionService personnelPermissionService;

    @Autowired
    public PersonnelPermissionController(IPersonnelPermissionService personnelPermissionService) {
        this.personnelPermissionService = personnelPermissionService;
    }

    @GetMapping
    public ResponseEntity<List<PersonnelPermissionResponseDto>> getAllEntities() {
        List<PersonnelPermissionResponseDto> entities = personnelPermissionService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonnelPermissionResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<PersonnelPermissionResponseDto> entity = personnelPermissionService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<PersonnelPermissionResponseDto> createEntity(@RequestBody PersonnelPermissionRequestDto personnelPermissionRequestDto) {
        PersonnelPermissionResponseDto savedEntity = personnelPermissionService.save(personnelPermissionRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonnelPermissionResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PersonnelPermissionRequestDto personnelPermissionRequestDto) {
        // ID'yi kontrol et
        if (!personnelPermissionService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        PersonnelPermissionResponseDto updatedEntity = personnelPermissionService.update(id, personnelPermissionRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            personnelPermissionService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}*/
