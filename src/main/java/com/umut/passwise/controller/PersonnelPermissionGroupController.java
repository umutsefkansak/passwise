package com.umut.passwise.controller;

import com.umut.passwise.dto.requests.BulkPermissionGroupRequestDto;
import com.umut.passwise.dto.requests.PersonnelPermissionGroupRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionGroupResponseDto;
import com.umut.passwise.entities.Admin;
import com.umut.passwise.entities.PermissionGroup;
import com.umut.passwise.entities.Personnel;
import com.umut.passwise.repository.AdminRepository;
import com.umut.passwise.repository.PermissionGroupRepository;
import com.umut.passwise.repository.PersonnelRepository;
import com.umut.passwise.service.abstracts.IAuthLogService;
import com.umut.passwise.service.abstracts.IPersonnelPermissionGroupService;
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
@RequestMapping("/api/personnel-permission-groups")
public class PersonnelPermissionGroupController {

    private final IPersonnelPermissionGroupService personnelPermissionGroupService;
    private final IAuthLogService authLogService;
    private final PersonnelRepository personnelRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final AdminRepository adminRepository;

    @Autowired
    public PersonnelPermissionGroupController(
            IPersonnelPermissionGroupService personnelPermissionGroupService,
            IAuthLogService authLogService,
            PersonnelRepository personnelRepository,
            PermissionGroupRepository permissionGroupRepository,
            AdminRepository adminRepository
    ) {
        this.personnelPermissionGroupService = personnelPermissionGroupService;
        this.authLogService = authLogService;
        this.personnelRepository = personnelRepository;
        this.permissionGroupRepository = permissionGroupRepository;
        this.adminRepository = adminRepository;
    }

    @GetMapping
    public ResponseEntity<List<PersonnelPermissionGroupResponseDto>> getAllEntities() {
        List<PersonnelPermissionGroupResponseDto> entities = personnelPermissionGroupService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonnelPermissionGroupResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<PersonnelPermissionGroupResponseDto> entity = personnelPermissionGroupService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<PersonnelPermissionGroupResponseDto> createEntity(@RequestBody PersonnelPermissionGroupRequestDto personnelPermissionGroupRequestDto) {
        PersonnelPermissionGroupResponseDto savedEntity = personnelPermissionGroupService.save(personnelPermissionGroupRequestDto);

        // Log oluştur
        authLogService.logPermissionGroupGrant(
                personnelPermissionGroupRequestDto.getGrantedByAdmin(),
                personnelPermissionGroupRequestDto.getPersonnel(),
                personnelPermissionGroupRequestDto.getPermissionGroup()
        );

        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<PersonnelPermissionGroupResponseDto>> createBulkPermissionGroups(@RequestBody BulkPermissionGroupRequestDto bulkRequestDto) {
        Personnel personnel = personnelRepository.findById(bulkRequestDto.getPersonnelId())
                .orElseThrow(() -> new EntityNotFoundException("Personnel not found with id: " + bulkRequestDto.getPersonnelId()));

        Admin admin = adminRepository.findById(bulkRequestDto.getAdminId())
                .orElseThrow(() -> new EntityNotFoundException("Admin not found with id: " + bulkRequestDto.getAdminId()));

        List<PermissionGroup> permissionGroups = permissionGroupRepository.findAllById(bulkRequestDto.getPermissionGroupIds());

        if (permissionGroups.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        List<PersonnelPermissionGroupResponseDto> savedEntities = new ArrayList<>();

        for (PermissionGroup permissionGroup : permissionGroups) {
            PersonnelPermissionGroupRequestDto requestDto = new PersonnelPermissionGroupRequestDto();
            requestDto.setPersonnel(personnel);
            requestDto.setPermissionGroup(permissionGroup);
            requestDto.setGrantedByAdmin(admin);

            PersonnelPermissionGroupResponseDto savedEntity = personnelPermissionGroupService.save(requestDto);
            savedEntities.add(savedEntity);
        }

        // Bir kerede toplu log ekle
        authLogService.logBulkPermissionGroupGrant(admin, personnel, permissionGroups);

        return new ResponseEntity<>(savedEntities, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonnelPermissionGroupResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PersonnelPermissionGroupRequestDto personnelPermissionGroupRequestDto) {
        // ID'yi kontrol et
        if (!personnelPermissionGroupService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        PersonnelPermissionGroupResponseDto updatedEntity = personnelPermissionGroupService.update(id, personnelPermissionGroupRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntity(@PathVariable("id") Long id) {
        try {
            // Silinecek grup izninin verilerini alalım
            Optional<PersonnelPermissionGroupResponseDto> permissionGroupOpt = personnelPermissionGroupService.findById(id);

            if (permissionGroupOpt.isPresent()) {
                PersonnelPermissionGroupResponseDto permissionGroup = permissionGroupOpt.get();

                // Log oluşturmak için gerekli verileri alıyoruz
                Admin admin = adminRepository.findById(permissionGroup.getGrantedByAdmin().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Admin not found"));

                Personnel personnel = personnelRepository.findById(permissionGroup.getPersonnel().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Personnel not found"));

                PermissionGroup group = permissionGroupRepository.findById(permissionGroup.getPermissionGroup().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Permission Group not found"));

                // İzni siliyoruz
                personnelPermissionGroupService.deleteById(id);

                // Silme işlemini logluyoruz
                authLogService.logPermissionGroupRevoke(admin, personnel, group);

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
    public ResponseEntity<Void> deleteBulkPermissionGroups(@RequestBody BulkPermissionGroupRequestDto bulkRequestDto) {
        try {
            Personnel personnel = personnelRepository.findById(bulkRequestDto.getPersonnelId())
                    .orElseThrow(() -> new EntityNotFoundException("Personnel not found with id: " + bulkRequestDto.getPersonnelId()));

            Admin admin = adminRepository.findById(bulkRequestDto.getAdminId())
                    .orElseThrow(() -> new EntityNotFoundException("Admin not found with id: " + bulkRequestDto.getAdminId()));

            List<PermissionGroup> permissionGroups = permissionGroupRepository.findAllById(bulkRequestDto.getPermissionGroupIds());

            if (permissionGroups.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            // Her bir yetki grubunu kaldır
            for (PermissionGroup group : permissionGroups) {
                personnelPermissionGroupService.deleteByPersonnelAndPermissionGroup(personnel, group);
            }

            // Toplu log kaydı oluştur (yeni metod kullanılarak)
            authLogService.logBulkPermissionGroupRevoke(admin, personnel, permissionGroups);

            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}


/*package com.umut.passwise.controller;
import com.umut.passwise.dto.requests.PersonnelPermissionGroupRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionGroupResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.umut.passwise.service.abstracts.IPersonnelPermissionGroupService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personnel-permission-groups")
public class PersonnelPermissionGroupController {

    private final IPersonnelPermissionGroupService personnelPermissionGroupService;

    @Autowired
    public PersonnelPermissionGroupController(IPersonnelPermissionGroupService personnelPermissionGroupService) {
        this.personnelPermissionGroupService = personnelPermissionGroupService;
    }

    @GetMapping
    public ResponseEntity<List<PersonnelPermissionGroupResponseDto>> getAllEntities() {
        List<PersonnelPermissionGroupResponseDto> entities = personnelPermissionGroupService.findAll();
        return new ResponseEntity<>(entities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonnelPermissionGroupResponseDto> getEntityById(@PathVariable("id") Long id) {
        Optional<PersonnelPermissionGroupResponseDto> entity = personnelPermissionGroupService.findById(id);
        return entity.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<PersonnelPermissionGroupResponseDto> createEntity(@RequestBody PersonnelPermissionGroupRequestDto personnelPermissionGroupRequestDto) {
        PersonnelPermissionGroupResponseDto savedEntity = personnelPermissionGroupService.save(personnelPermissionGroupRequestDto);
        return new ResponseEntity<>(savedEntity, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonnelPermissionGroupResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody PersonnelPermissionGroupRequestDto personnelPermissionGroupRequestDto) {
        // ID'yi kontrol et
        if (!personnelPermissionGroupService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Entity'yi bul ve güncelle
        PersonnelPermissionGroupResponseDto updatedEntity = personnelPermissionGroupService.update(id, personnelPermissionGroupRequestDto);

        // Güncellenen entity'yi döndür
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteEntity(@PathVariable("id") Long id) {
        try {
            personnelPermissionGroupService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
*/