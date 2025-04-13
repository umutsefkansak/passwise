package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.PersonnelPermissionRequestDto;
import com.umut.passwise.dto.responses.PersonnelPermissionResponseDto;
import com.umut.passwise.entities.Door;
import com.umut.passwise.entities.Personnel;
import com.umut.passwise.service.abstracts.IPersonnelPermissionService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.PersonnelPermission;
import com.umut.passwise.repository.PersonnelPermissionRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PersonnelPermissionServiceImpl implements IPersonnelPermissionService {

    private final PersonnelPermissionRepository personnelPermissionRepository;

    @Autowired
    public PersonnelPermissionServiceImpl(PersonnelPermissionRepository personnelPermissionRepository) {
        this.personnelPermissionRepository = personnelPermissionRepository;
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

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (personnelPermission.isPresent()) {
            PersonnelPermissionResponseDto dto = new PersonnelPermissionResponseDto();
            BeanUtils.copyProperties(personnelPermission.get(), dto);  // personnelPermission.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
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
        // Mevcut entity'yi bul
        Optional<PersonnelPermission> personnelPermissionOptional = personnelPermissionRepository.findById(id);

        if (personnelPermissionOptional.isPresent()) {
            PersonnelPermission personnelPermission = personnelPermissionOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(personnelPermissionRequestDto, personnelPermission);

            // Güncellenmiş entity'yi kaydet
            personnelPermissionRepository.save(personnelPermission);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            PersonnelPermissionResponseDto personnelPermissionResponseDto = new PersonnelPermissionResponseDto();
            BeanUtils.copyProperties(personnelPermission, personnelPermissionResponseDto);

            return personnelPermissionResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("PersonnelPermission with ID " + id + " not found");
        }
    }

    @Override
    public boolean existsByPersonnelAndDoor(Personnel personnel, Door door){
        return personnelPermissionRepository.existsByPersonnelAndDoor(personnel,door);
    }


    public void deleteById(Long id) {
        personnelPermissionRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personnelPermissionRepository.existsById(id);
    }
    @Override
    public void deleteByPersonnelAndDoor(Personnel personnel, Door door) {
        // Repository'de uygun bir metot oluşturun
        personnelPermissionRepository.deleteByPersonnelAndDoor(personnel, door);
    }


}
