package com.umut.passwise.service.impl;

import com.umut.passwise.dto.requests.BulkPermissionGroupRequestDto;
import com.umut.passwise.dto.requests.PersonnelPermissionGroupRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionGroupResponseDto;
import com.umut.passwise.entities.Admin;
import com.umut.passwise.entities.Permission;
import com.umut.passwise.entities.PermissionGroup;
import com.umut.passwise.entities.Personnel;
import com.umut.passwise.entities.PersonnelPermissionGroup;
import com.umut.passwise.repository.AdminRepository;
import com.umut.passwise.repository.PermissionGroupRepository;
import com.umut.passwise.repository.PersonnelPermissionGroupRepository;
import com.umut.passwise.repository.PersonnelRepository;
import com.umut.passwise.service.abstracts.IAuthLogService;
import com.umut.passwise.service.abstracts.IPersonnelPermissionGroupService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class PersonnelPermissionGroupServiceImpl implements IPersonnelPermissionGroupService {

    private final PersonnelPermissionGroupRepository personnelPermissionGroupRepository;
    private final PersonnelRepository personnelRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final AdminRepository adminRepository;
    private final IAuthLogService authLogService;

    @Autowired
    public PersonnelPermissionGroupServiceImpl(
            PersonnelPermissionGroupRepository personnelPermissionGroupRepository,
            PersonnelRepository personnelRepository,
            PermissionGroupRepository permissionGroupRepository,
            AdminRepository adminRepository,
            IAuthLogService authLogService) {
        this.personnelPermissionGroupRepository = personnelPermissionGroupRepository;
        this.personnelRepository = personnelRepository;
        this.permissionGroupRepository = permissionGroupRepository;
        this.adminRepository = adminRepository;
        this.authLogService = authLogService;
    }

    @Override
    public List<PersonnelPermissionGroupResponseDto> findAll() {
        List<PersonnelPermissionGroup> personnelPermissionGrouplist = personnelPermissionGroupRepository.findAll();
        List<PersonnelPermissionGroupResponseDto> dtoList = new ArrayList<>();

        for(PersonnelPermissionGroup personnelPermissionGroup: personnelPermissionGrouplist){
            PersonnelPermissionGroupResponseDto dto = new PersonnelPermissionGroupResponseDto();
            BeanUtils.copyProperties(personnelPermissionGroup, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<PersonnelPermissionGroupResponseDto> findById(Long id) {
        Optional<PersonnelPermissionGroup> personnelPermissionGroup = personnelPermissionGroupRepository.findById(id);

        if (personnelPermissionGroup.isPresent()) {
            PersonnelPermissionGroupResponseDto dto = new PersonnelPermissionGroupResponseDto();
            BeanUtils.copyProperties(personnelPermissionGroup.get(), dto);
            return Optional.of(dto);
        }

        return Optional.empty();
    }

    @Override
    public PersonnelPermissionGroupResponseDto save(PersonnelPermissionGroupRequestDto personnelPermissionGroupRequestDto) {
        PersonnelPermissionGroup personnelPermissionGroup = new PersonnelPermissionGroup();
        PersonnelPermissionGroupResponseDto personnelPermissionGroupResponseDto = new PersonnelPermissionGroupResponseDto();

        BeanUtils.copyProperties(personnelPermissionGroupRequestDto, personnelPermissionGroup);
        personnelPermissionGroupRepository.save(personnelPermissionGroup);
        BeanUtils.copyProperties(personnelPermissionGroup, personnelPermissionGroupResponseDto);

        return personnelPermissionGroupResponseDto;
    }

    @Override
    public PersonnelPermissionGroupResponseDto update(Long id, PersonnelPermissionGroupRequestDto personnelPermissionGroupRequestDto) {
        Optional<PersonnelPermissionGroup> personnelPermissionGroupOptional = personnelPermissionGroupRepository.findById(id);

        if (personnelPermissionGroupOptional.isPresent()) {
            PersonnelPermissionGroup personnelPermissionGroup = personnelPermissionGroupOptional.get();
            BeanUtils.copyProperties(personnelPermissionGroupRequestDto, personnelPermissionGroup);
            personnelPermissionGroupRepository.save(personnelPermissionGroup);

            PersonnelPermissionGroupResponseDto personnelPermissionGroupResponseDto = new PersonnelPermissionGroupResponseDto();
            BeanUtils.copyProperties(personnelPermissionGroup, personnelPermissionGroupResponseDto);

            return personnelPermissionGroupResponseDto;
        } else {
            throw new EntityNotFoundException("PersonnelPermissionGroup with ID " + id + " not found");
        }
    }

    @Override
    public boolean hasIndirectPermission(Personnel personnel, Long doorId){
        // Personelin üye olduğu yetki gruplarını bul
        boolean hasIndirectPermission = false;
        Set<PersonnelPermissionGroup> permissionGroups = personnel.getPermissionGroupMemberships();
        if (permissionGroups != null && !permissionGroups.isEmpty()) {
            for (PersonnelPermissionGroup personnelPermissionGroup : permissionGroups) {
                // Her bir yetki grubunun içindeki kapı yetkilerini kontrol et
                PermissionGroup group = personnelPermissionGroup.getPermissionGroup();
                Set<Permission> permissions = group.getPermissions();

                if (permissions != null) {
                    for (Permission permission : permissions) {
                        if (permission.getDoor().getId().equals(doorId)) {
                            hasIndirectPermission = true;
                            return hasIndirectPermission;
                        }
                    }
                }
            }
        }
        return hasIndirectPermission;
    }

    @Override
    public void deleteById(Long id) {
        personnelPermissionGroupRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personnelPermissionGroupRepository.existsById(id);
    }

    @Override
    public void deleteByPersonnelAndPermissionGroup(Personnel personnel, PermissionGroup permissionGroup) {
        personnelPermissionGroupRepository.deleteByPersonnelAndPermissionGroup(personnel, permissionGroup);
    }

    @Override
    public boolean existsByPersonnelAndPermissionGroup(Personnel personnel, PermissionGroup permissionGroup) {
        return personnelPermissionGroupRepository.existsByPersonnelAndPermissionGroup(personnel, permissionGroup);
    }

    // Controller'dan taşınan yeni metodlar
    @Override
    public PersonnelPermissionGroupResponseDto grantPermissionGroup(PersonnelPermissionGroupRequestDto dto) {
        PersonnelPermissionGroupResponseDto savedEntity = save(dto);

        // Log oluştur
        authLogService.logPermissionGroupGrant(
                dto.getGrantedByAdmin(),
                dto.getPersonnel(),
                dto.getPermissionGroup()
        );

        return savedEntity;
    }

    @Override
    public List<PersonnelPermissionGroupResponseDto> grantBulkPermissionGroups(BulkPermissionGroupRequestDto bulkRequestDto) {
        Personnel personnel = personnelRepository.findById(bulkRequestDto.getPersonnelId())
                .orElseThrow(() -> new EntityNotFoundException("Personnel not found with id: " + bulkRequestDto.getPersonnelId()));

        Admin admin = adminRepository.findById(bulkRequestDto.getAdminId())
                .orElseThrow(() -> new EntityNotFoundException("Admin not found with id: " + bulkRequestDto.getAdminId()));

        List<PermissionGroup> permissionGroups = permissionGroupRepository.findAllById(bulkRequestDto.getPermissionGroupIds());

        if (permissionGroups.isEmpty()) {
            throw new IllegalArgumentException("No valid permission groups found for the provided IDs");
        }

        List<PersonnelPermissionGroupResponseDto> savedEntities = new ArrayList<>();

        for (PermissionGroup permissionGroup : permissionGroups) {
            // Aynı personel-grup ilişkisi zaten var mı kontrol et
            if (existsByPersonnelAndPermissionGroup(personnel, permissionGroup)) {
                continue;
            }

            PersonnelPermissionGroupRequestDto requestDto = new PersonnelPermissionGroupRequestDto();
            requestDto.setPersonnel(personnel);
            requestDto.setPermissionGroup(permissionGroup);
            requestDto.setGrantedByAdmin(admin);

            PersonnelPermissionGroupResponseDto savedEntity = save(requestDto);
            savedEntities.add(savedEntity);
        }

        // Bir kerede toplu log ekle
        if (!savedEntities.isEmpty()) {
            authLogService.logBulkPermissionGroupGrant(admin, personnel, permissionGroups);
        }

        return savedEntities;
    }

    @Override
    public void revokePermissionGroup(Long id) {
        Optional<PersonnelPermissionGroupResponseDto> permissionGroupOpt = findById(id);

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
            deleteById(id);

            // Silme işlemini logluyoruz
            authLogService.logPermissionGroupRevoke(admin, personnel, group);
        } else {
            throw new EntityNotFoundException("PersonnelPermissionGroup with ID " + id + " not found");
        }
    }

    @Override
    @Transactional
    public void revokeBulkPermissionGroups(BulkPermissionGroupRequestDto bulkRequestDto) {
        Personnel personnel = personnelRepository.findById(bulkRequestDto.getPersonnelId())
                .orElseThrow(() -> new EntityNotFoundException("Personnel not found with id: " + bulkRequestDto.getPersonnelId()));

        Admin admin = adminRepository.findById(bulkRequestDto.getAdminId())
                .orElseThrow(() -> new EntityNotFoundException("Admin not found with id: " + bulkRequestDto.getAdminId()));

        List<PermissionGroup> permissionGroups = permissionGroupRepository.findAllById(bulkRequestDto.getPermissionGroupIds());

        if (permissionGroups.isEmpty()) {
            throw new IllegalArgumentException("No valid permission groups found for the provided IDs");
        }

        // Her bir yetki grubunu kaldır
        for (PermissionGroup group : permissionGroups) {
            deleteByPersonnelAndPermissionGroup(personnel, group);
        }

        // Toplu log kaydı oluştur
        authLogService.logBulkPermissionGroupRevoke(admin, personnel, permissionGroups);
    }
}