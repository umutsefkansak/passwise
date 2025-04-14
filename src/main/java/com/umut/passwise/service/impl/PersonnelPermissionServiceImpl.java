package com.umut.passwise.service.impl;

import com.umut.passwise.dto.requests.BulkDoorPermissionRequestDto;
import com.umut.passwise.dto.requests.PersonnelPermissionRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionResponseDto;
import com.umut.passwise.entities.Admin;
import com.umut.passwise.entities.Door;
import com.umut.passwise.entities.Personnel;
import com.umut.passwise.entities.PersonnelPermission;
import com.umut.passwise.repository.AdminRepository;
import com.umut.passwise.repository.DoorRepository;
import com.umut.passwise.repository.PersonnelPermissionRepository;
import com.umut.passwise.repository.PersonnelRepository;
import com.umut.passwise.service.abstracts.IAuthLogService;
import com.umut.passwise.service.abstracts.IPersonnelPermissionService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PersonnelPermissionServiceImpl implements IPersonnelPermissionService {

    private final PersonnelPermissionRepository personnelPermissionRepository;
    private final PersonnelRepository personnelRepository;
    private final DoorRepository doorRepository;
    private final AdminRepository adminRepository;
    private final IAuthLogService authLogService;

    @Autowired
    public PersonnelPermissionServiceImpl(
            PersonnelPermissionRepository personnelPermissionRepository,
            PersonnelRepository personnelRepository,
            DoorRepository doorRepository,
            AdminRepository adminRepository,
            IAuthLogService authLogService) {
        this.personnelPermissionRepository = personnelPermissionRepository;
        this.personnelRepository = personnelRepository;
        this.doorRepository = doorRepository;
        this.adminRepository = adminRepository;
        this.authLogService = authLogService;
    }

    @Override
    public List<PersonnelPermissionResponseDto> findAll() {
        List<PersonnelPermission> personnelPermissionlist = personnelPermissionRepository.findAll();
        List<PersonnelPermissionResponseDto> dtoList = new ArrayList<>();

        for(PersonnelPermission personnelPermission: personnelPermissionlist){
            PersonnelPermissionResponseDto dto = new PersonnelPermissionResponseDto();
            BeanUtils.copyProperties(personnelPermission, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<PersonnelPermissionResponseDto> findById(Long id) {
        Optional<PersonnelPermission> personnelPermission = personnelPermissionRepository.findById(id);

        if (personnelPermission.isPresent()) {
            PersonnelPermissionResponseDto dto = new PersonnelPermissionResponseDto();
            BeanUtils.copyProperties(personnelPermission.get(), dto);
            return Optional.of(dto);
        }

        return Optional.empty();
    }

    @Override
    public PersonnelPermissionResponseDto save(PersonnelPermissionRequestDto personnelPermissionRequestDto) {
        PersonnelPermission personnelPermission = new PersonnelPermission();
        PersonnelPermissionResponseDto personnelPermissionResponseDto = new PersonnelPermissionResponseDto();

        BeanUtils.copyProperties(personnelPermissionRequestDto, personnelPermission);
        personnelPermissionRepository.save(personnelPermission);
        BeanUtils.copyProperties(personnelPermission, personnelPermissionResponseDto);

        return personnelPermissionResponseDto;
    }

    @Override
    public PersonnelPermissionResponseDto update(Long id, PersonnelPermissionRequestDto personnelPermissionRequestDto) {
        Optional<PersonnelPermission> personnelPermissionOptional = personnelPermissionRepository.findById(id);

        if (personnelPermissionOptional.isPresent()) {
            PersonnelPermission personnelPermission = personnelPermissionOptional.get();
            BeanUtils.copyProperties(personnelPermissionRequestDto, personnelPermission);
            personnelPermissionRepository.save(personnelPermission);

            PersonnelPermissionResponseDto personnelPermissionResponseDto = new PersonnelPermissionResponseDto();
            BeanUtils.copyProperties(personnelPermission, personnelPermissionResponseDto);

            return personnelPermissionResponseDto;
        } else {
            throw new EntityNotFoundException("PersonnelPermission with ID " + id + " not found");
        }
    }

    @Override
    public boolean existsByPersonnelAndDoor(Personnel personnel, Door door){
        return personnelPermissionRepository.existsByPersonnelAndDoor(personnel, door);
    }

    @Override
    public void deleteById(Long id) {
        personnelPermissionRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personnelPermissionRepository.existsById(id);
    }

    @Override
    public void deleteByPersonnelAndDoor(Personnel personnel, Door door) {
        personnelPermissionRepository.deleteByPersonnelAndDoor(personnel, door);
    }

    // Controller'dan taşınan yeni metodlar
    @Override
    public PersonnelPermissionResponseDto grantPermission(PersonnelPermissionRequestDto dto) {
        PersonnelPermissionResponseDto savedEntity = save(dto);

        // Log oluştur
        authLogService.logDoorPermissionGrant(
                dto.getAdmin(),
                dto.getPersonnel(),
                dto.getDoor()
        );

        return savedEntity;
    }

    @Override
    public List<PersonnelPermissionResponseDto> grantBulkPermissions(BulkDoorPermissionRequestDto bulkRequestDto) {
        Personnel personnel = personnelRepository.findById(bulkRequestDto.getPersonnelId())
                .orElseThrow(() -> new EntityNotFoundException("Personnel not found with id: " + bulkRequestDto.getPersonnelId()));

        Admin admin = adminRepository.findById(bulkRequestDto.getAdminId())
                .orElseThrow(() -> new EntityNotFoundException("Admin not found with id: " + bulkRequestDto.getAdminId()));

        List<Door> doors = doorRepository.findAllById(bulkRequestDto.getDoorIds());

        if (doors.isEmpty()) {
            throw new IllegalArgumentException("No valid doors found for the provided IDs");
        }

        List<PersonnelPermissionResponseDto> savedEntities = new ArrayList<>();

        for (Door door : doors) {
            // Eğer bu personel-kapı ilişkisi zaten varsa atla
            if (existsByPersonnelAndDoor(personnel, door)) {
                continue;
            }

            PersonnelPermissionRequestDto requestDto = new PersonnelPermissionRequestDto();
            requestDto.setPersonnel(personnel);
            requestDto.setDoor(door);
            requestDto.setAdmin(admin);

            PersonnelPermissionResponseDto savedEntity = save(requestDto);
            savedEntities.add(savedEntity);
        }

        // Bir kerede toplu log ekle
        if (!savedEntities.isEmpty()) {
            authLogService.logBulkDoorPermissionGrant(admin, personnel, doors);
        }

        return savedEntities;
    }

    @Override
    public void revokePermission(Long id) {
        Optional<PersonnelPermissionResponseDto> permissionOpt = findById(id);

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
            deleteById(id);

            // Silme işlemini logluyoruz
            authLogService.logDoorPermissionRevoke(admin, personnel, door);
        } else {
            throw new EntityNotFoundException("PersonnelPermission with ID " + id + " not found");
        }
    }

    @Override
    @Transactional
    public void revokeBulkPermissions(BulkDoorPermissionRequestDto bulkRequestDto) {
        Personnel personnel = personnelRepository.findById(bulkRequestDto.getPersonnelId())
                .orElseThrow(() -> new EntityNotFoundException("Personnel not found with id: " + bulkRequestDto.getPersonnelId()));

        Admin admin = adminRepository.findById(bulkRequestDto.getAdminId())
                .orElseThrow(() -> new EntityNotFoundException("Admin not found with id: " + bulkRequestDto.getAdminId()));

        List<Door> doors = doorRepository.findAllById(bulkRequestDto.getDoorIds());

        if (doors.isEmpty()) {
            throw new IllegalArgumentException("No valid doors found for the provided IDs");
        }

        // Her bir kapı yetkisini kaldır
        for (Door door : doors) {
            deleteByPersonnelAndDoor(personnel, door);
        }

        // Toplu log kaydı oluştur
        authLogService.logBulkDoorPermissionRevoke(admin, personnel, doors);
    }
}
