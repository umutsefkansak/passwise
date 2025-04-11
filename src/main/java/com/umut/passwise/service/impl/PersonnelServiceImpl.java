package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.PersonnelRequestDto;
import com.umut.passwise.dto.responses.PersonnelResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.Personnel;
import com.umut.passwise.repository.PersonnelRepository;
import com.umut.passwise.service.abstracts.IPersonnelService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PersonnelServiceImpl implements IPersonnelService {

    private final PersonnelRepository personnelRepository;

    @Autowired
    public PersonnelServiceImpl(PersonnelRepository personnelRepository) {
        this.personnelRepository = personnelRepository;
    }

    @Override
    public List<PersonnelResponseDto> findAll() {
        List<Personnel> personnellist = personnelRepository.findAll();
        List<PersonnelResponseDto> dtoList = new ArrayList<>();

        for(Personnel personnel: personnellist){
            PersonnelResponseDto dto = new PersonnelResponseDto();
            BeanUtils.copyProperties(personnel, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<PersonnelResponseDto> findById(Long id) {
        Optional<Personnel> personnel = personnelRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (personnel.isPresent()) {
            PersonnelResponseDto dto = new PersonnelResponseDto();
            BeanUtils.copyProperties(personnel.get(), dto);  // personnel.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public PersonnelResponseDto save(PersonnelRequestDto personnelRequestDto) {
        Personnel personnel = new Personnel();
        PersonnelResponseDto personnelResponseDto = new PersonnelResponseDto();

        BeanUtils.copyProperties(personnelRequestDto, personnel);

        personnelRepository.save(personnel);

        BeanUtils.copyProperties(personnel, personnelResponseDto);

        return personnelResponseDto;
    }

    @Override
    public PersonnelResponseDto update(Long id, PersonnelRequestDto personnelRequestDto) {
        // Mevcut entity'yi bul
        Optional<Personnel> personnelOptional = personnelRepository.findById(id);

        if (personnelOptional.isPresent()) {
            Personnel personnel = personnelOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(personnelRequestDto, personnel);

            // Güncellenmiş entity'yi kaydet
            personnelRepository.save(personnel);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            PersonnelResponseDto personnelResponseDto = new PersonnelResponseDto();
            BeanUtils.copyProperties(personnel, personnelResponseDto);

            return personnelResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("Personnel with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        personnelRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personnelRepository.existsById(id);
    }
}
