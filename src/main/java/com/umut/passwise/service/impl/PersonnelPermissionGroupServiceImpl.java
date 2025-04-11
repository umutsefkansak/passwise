package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.PersonnelPermissionGroupRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionGroupResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.PersonnelPermissionGroup;
import com.umut.passwise.repository.PersonnelPermissionGroupRepository;
import com.umut.passwise.service.abstracts.IPersonnelPermissionGroupService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PersonnelPermissionGroupServiceImpl implements IPersonnelPermissionGroupService {

    private final PersonnelPermissionGroupRepository personnelPermissionGroupRepository;

    @Autowired
    public PersonnelPermissionGroupServiceImpl(PersonnelPermissionGroupRepository personnelPermissionGroupRepository) {
        this.personnelPermissionGroupRepository = personnelPermissionGroupRepository;
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

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (personnelPermissionGroup.isPresent()) {
            PersonnelPermissionGroupResponseDto dto = new PersonnelPermissionGroupResponseDto();
            BeanUtils.copyProperties(personnelPermissionGroup.get(), dto);  // personnelPermissionGroup.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
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
        // Mevcut entity'yi bul
        Optional<PersonnelPermissionGroup> personnelPermissionGroupOptional = personnelPermissionGroupRepository.findById(id);

        if (personnelPermissionGroupOptional.isPresent()) {
            PersonnelPermissionGroup personnelPermissionGroup = personnelPermissionGroupOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(personnelPermissionGroupRequestDto, personnelPermissionGroup);

            // Güncellenmiş entity'yi kaydet
            personnelPermissionGroupRepository.save(personnelPermissionGroup);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            PersonnelPermissionGroupResponseDto personnelPermissionGroupResponseDto = new PersonnelPermissionGroupResponseDto();
            BeanUtils.copyProperties(personnelPermissionGroup, personnelPermissionGroupResponseDto);

            return personnelPermissionGroupResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("PersonnelPermissionGroup with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        personnelPermissionGroupRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personnelPermissionGroupRepository.existsById(id);
    }
}
