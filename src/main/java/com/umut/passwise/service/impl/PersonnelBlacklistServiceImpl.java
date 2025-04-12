package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.PersonnelBlacklistRequestDto;
import com.umut.passwise.dto.responses.PersonnelBlacklistResponseDto;
import com.umut.passwise.entities.Personnel;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.PersonnelBlacklist;
import com.umut.passwise.repository.PersonnelBlacklistRepository;
import com.umut.passwise.service.abstracts.IPersonnelBlacklistService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PersonnelBlacklistServiceImpl implements IPersonnelBlacklistService {

    private final PersonnelBlacklistRepository personnelBlacklistRepository;

    @Autowired
    public PersonnelBlacklistServiceImpl(PersonnelBlacklistRepository personnelBlacklistRepository) {
        this.personnelBlacklistRepository = personnelBlacklistRepository;
    }

    @Override
    public List<PersonnelBlacklistResponseDto> findAll() {
        List<PersonnelBlacklist> personnelBlacklistlist = personnelBlacklistRepository.findAll();
        List<PersonnelBlacklistResponseDto> dtoList = new ArrayList<>();

        for(PersonnelBlacklist personnelBlacklist: personnelBlacklistlist){
            PersonnelBlacklistResponseDto dto = new PersonnelBlacklistResponseDto();
            BeanUtils.copyProperties(personnelBlacklist, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<PersonnelBlacklistResponseDto> findById(Long id) {
        Optional<PersonnelBlacklist> personnelBlacklist = personnelBlacklistRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (personnelBlacklist.isPresent()) {
            PersonnelBlacklistResponseDto dto = new PersonnelBlacklistResponseDto();
            BeanUtils.copyProperties(personnelBlacklist.get(), dto);  // personnelBlacklist.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public PersonnelBlacklistResponseDto save(PersonnelBlacklistRequestDto personnelBlacklistRequestDto) {
        PersonnelBlacklist personnelBlacklist = new PersonnelBlacklist();
        PersonnelBlacklistResponseDto personnelBlacklistResponseDto = new PersonnelBlacklistResponseDto();

        BeanUtils.copyProperties(personnelBlacklistRequestDto, personnelBlacklist);

        personnelBlacklistRepository.save(personnelBlacklist);

        BeanUtils.copyProperties(personnelBlacklist, personnelBlacklistResponseDto);

        return personnelBlacklistResponseDto;
    }

    @Override
    public PersonnelBlacklistResponseDto update(Long id, PersonnelBlacklistRequestDto personnelBlacklistRequestDto) {
        // Mevcut entity'yi bul
        Optional<PersonnelBlacklist> personnelBlacklistOptional = personnelBlacklistRepository.findById(id);

        if (personnelBlacklistOptional.isPresent()) {
            PersonnelBlacklist personnelBlacklist = personnelBlacklistOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(personnelBlacklistRequestDto, personnelBlacklist);

            // Güncellenmiş entity'yi kaydet
            personnelBlacklistRepository.save(personnelBlacklist);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            PersonnelBlacklistResponseDto personnelBlacklistResponseDto = new PersonnelBlacklistResponseDto();
            BeanUtils.copyProperties(personnelBlacklist, personnelBlacklistResponseDto);

            return personnelBlacklistResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("PersonnelBlacklist with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        personnelBlacklistRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personnelBlacklistRepository.existsById(id);
    }

    @Override
    public boolean existsByPersonnel(Personnel personnel) {
        return personnelBlacklistRepository.existsByPersonnel(personnel);
    }
}
