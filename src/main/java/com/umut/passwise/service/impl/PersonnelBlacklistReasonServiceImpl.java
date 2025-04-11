package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.PersonnelBlacklistReasonRequestDto;
import com.umut.passwise.dto.responses.PersonnelBlacklistReasonResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.PersonnelBlacklistReason;
import com.umut.passwise.repository.PersonnelBlacklistReasonRepository;
import com.umut.passwise.service.abstracts.IPersonnelBlacklistReasonService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PersonnelBlacklistReasonServiceImpl implements IPersonnelBlacklistReasonService {

    private final PersonnelBlacklistReasonRepository personnelBlacklistReasonRepository;

    @Autowired
    public PersonnelBlacklistReasonServiceImpl(PersonnelBlacklistReasonRepository personnelBlacklistReasonRepository) {
        this.personnelBlacklistReasonRepository = personnelBlacklistReasonRepository;
    }

    @Override
    public List<PersonnelBlacklistReasonResponseDto> findAll() {
        List<PersonnelBlacklistReason> personnelBlacklistReasonlist = personnelBlacklistReasonRepository.findAll();
        List<PersonnelBlacklistReasonResponseDto> dtoList = new ArrayList<>();

        for(PersonnelBlacklistReason personnelBlacklistReason: personnelBlacklistReasonlist){
            PersonnelBlacklistReasonResponseDto dto = new PersonnelBlacklistReasonResponseDto();
            BeanUtils.copyProperties(personnelBlacklistReason, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<PersonnelBlacklistReasonResponseDto> findById(Long id) {
        Optional<PersonnelBlacklistReason> personnelBlacklistReason = personnelBlacklistReasonRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (personnelBlacklistReason.isPresent()) {
            PersonnelBlacklistReasonResponseDto dto = new PersonnelBlacklistReasonResponseDto();
            BeanUtils.copyProperties(personnelBlacklistReason.get(), dto);  // personnelBlacklistReason.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public PersonnelBlacklistReasonResponseDto save(PersonnelBlacklistReasonRequestDto personnelBlacklistReasonRequestDto) {
        PersonnelBlacklistReason personnelBlacklistReason = new PersonnelBlacklistReason();
        PersonnelBlacklistReasonResponseDto personnelBlacklistReasonResponseDto = new PersonnelBlacklistReasonResponseDto();

        BeanUtils.copyProperties(personnelBlacklistReasonRequestDto, personnelBlacklistReason);

        personnelBlacklistReasonRepository.save(personnelBlacklistReason);

        BeanUtils.copyProperties(personnelBlacklistReason, personnelBlacklistReasonResponseDto);

        return personnelBlacklistReasonResponseDto;
    }

    @Override
    public PersonnelBlacklistReasonResponseDto update(Long id, PersonnelBlacklistReasonRequestDto personnelBlacklistReasonRequestDto) {
        // Mevcut entity'yi bul
        Optional<PersonnelBlacklistReason> personnelBlacklistReasonOptional = personnelBlacklistReasonRepository.findById(id);

        if (personnelBlacklistReasonOptional.isPresent()) {
            PersonnelBlacklistReason personnelBlacklistReason = personnelBlacklistReasonOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(personnelBlacklistReasonRequestDto, personnelBlacklistReason);

            // Güncellenmiş entity'yi kaydet
            personnelBlacklistReasonRepository.save(personnelBlacklistReason);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            PersonnelBlacklistReasonResponseDto personnelBlacklistReasonResponseDto = new PersonnelBlacklistReasonResponseDto();
            BeanUtils.copyProperties(personnelBlacklistReason, personnelBlacklistReasonResponseDto);

            return personnelBlacklistReasonResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("PersonnelBlacklistReason with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        personnelBlacklistReasonRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personnelBlacklistReasonRepository.existsById(id);
    }
}
