package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.PermissionGroupRequestDto;
import com.umut.passwise.dto.responses.PermissionGroupResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.PermissionGroup;
import com.umut.passwise.repository.PermissionGroupRepository;
import com.umut.passwise.service.abstracts.IPermissionGroupService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PermissionGroupServiceImpl implements IPermissionGroupService {

    private final PermissionGroupRepository permissionGroupRepository;

    @Autowired
    public PermissionGroupServiceImpl(PermissionGroupRepository permissionGroupRepository) {
        this.permissionGroupRepository = permissionGroupRepository;
    }

    @Override
    public List<PermissionGroupResponseDto> findAll() {
        List<PermissionGroup> permissionGrouplist = permissionGroupRepository.findAll();
        List<PermissionGroupResponseDto> dtoList = new ArrayList<>();

        for(PermissionGroup permissionGroup: permissionGrouplist){
            PermissionGroupResponseDto dto = new PermissionGroupResponseDto();
            BeanUtils.copyProperties(permissionGroup, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<PermissionGroupResponseDto> findById(Long id) {
        Optional<PermissionGroup> permissionGroup = permissionGroupRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (permissionGroup.isPresent()) {
            PermissionGroupResponseDto dto = new PermissionGroupResponseDto();
            BeanUtils.copyProperties(permissionGroup.get(), dto);  // permissionGroup.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public PermissionGroupResponseDto save(PermissionGroupRequestDto permissionGroupRequestDto) {
        PermissionGroup permissionGroup = new PermissionGroup();
        PermissionGroupResponseDto permissionGroupResponseDto = new PermissionGroupResponseDto();

        BeanUtils.copyProperties(permissionGroupRequestDto, permissionGroup);

        permissionGroupRepository.save(permissionGroup);

        BeanUtils.copyProperties(permissionGroup, permissionGroupResponseDto);

        return permissionGroupResponseDto;
    }

    @Override
    public PermissionGroupResponseDto update(Long id, PermissionGroupRequestDto permissionGroupRequestDto) {
        // Mevcut entity'yi bul
        Optional<PermissionGroup> permissionGroupOptional = permissionGroupRepository.findById(id);

        if (permissionGroupOptional.isPresent()) {
            PermissionGroup permissionGroup = permissionGroupOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(permissionGroupRequestDto, permissionGroup);

            // Güncellenmiş entity'yi kaydet
            permissionGroupRepository.save(permissionGroup);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            PermissionGroupResponseDto permissionGroupResponseDto = new PermissionGroupResponseDto();
            BeanUtils.copyProperties(permissionGroup, permissionGroupResponseDto);

            return permissionGroupResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("PermissionGroup with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        permissionGroupRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return permissionGroupRepository.existsById(id);
    }
}
