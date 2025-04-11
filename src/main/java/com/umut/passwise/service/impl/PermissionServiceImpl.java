package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.PermissionRequestDto;
import com.umut.passwise.dto.responses.PermissionResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.Permission;
import com.umut.passwise.repository.PermissionRepository;
import com.umut.passwise.service.abstracts.IPermissionService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PermissionServiceImpl implements IPermissionService {

    private final PermissionRepository permissionRepository;

    @Autowired
    public PermissionServiceImpl(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @Override
    public List<PermissionResponseDto> findAll() {
        List<Permission> permissionlist = permissionRepository.findAll();
        List<PermissionResponseDto> dtoList = new ArrayList<>();

        for(Permission permission: permissionlist){
            PermissionResponseDto dto = new PermissionResponseDto();
            BeanUtils.copyProperties(permission, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<PermissionResponseDto> findById(Long id) {
        Optional<Permission> permission = permissionRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (permission.isPresent()) {
            PermissionResponseDto dto = new PermissionResponseDto();
            BeanUtils.copyProperties(permission.get(), dto);  // permission.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public PermissionResponseDto save(PermissionRequestDto permissionRequestDto) {
        Permission permission = new Permission();
        PermissionResponseDto permissionResponseDto = new PermissionResponseDto();

        BeanUtils.copyProperties(permissionRequestDto, permission);

        permissionRepository.save(permission);

        BeanUtils.copyProperties(permission, permissionResponseDto);

        return permissionResponseDto;
    }

    @Override
    public PermissionResponseDto update(Long id, PermissionRequestDto permissionRequestDto) {
        // Mevcut entity'yi bul
        Optional<Permission> permissionOptional = permissionRepository.findById(id);

        if (permissionOptional.isPresent()) {
            Permission permission = permissionOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(permissionRequestDto, permission);

            // Güncellenmiş entity'yi kaydet
            permissionRepository.save(permission);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            PermissionResponseDto permissionResponseDto = new PermissionResponseDto();
            BeanUtils.copyProperties(permission, permissionResponseDto);

            return permissionResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("Permission with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        permissionRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return permissionRepository.existsById(id);
    }
}
