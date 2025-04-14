package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.PersonnelBlacklistRequestDto;
import com.umut.passwise.dto.responses.PersonnelBlacklistResponseDto;
import com.umut.passwise.entities.Card;
import com.umut.passwise.entities.Personnel;
import com.umut.passwise.repository.PersonnelRepository;
import com.umut.passwise.service.abstracts.IPersonnelService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.PersonnelBlacklist;
import com.umut.passwise.repository.PersonnelBlacklistRepository;
import com.umut.passwise.service.abstracts.IPersonnelBlacklistService;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PersonnelBlacklistServiceImpl implements IPersonnelBlacklistService {

    private final PersonnelBlacklistRepository personnelBlacklistRepository;
    private final PersonnelRepository personnelRepository;

    @Autowired
    public PersonnelBlacklistServiceImpl(PersonnelBlacklistRepository personnelBlacklistRepository, PersonnelRepository personnelRepository) {
        this.personnelBlacklistRepository = personnelBlacklistRepository;
        this.personnelRepository = personnelRepository;
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

        //PERSONELİN ÇALIŞMA DURUMUNU PASİF YAP
        /*Optional<Personnel> personnelOptional = personnelRepository.findById(personnelBlacklistRequestDto.getPersonnel().getId());
        if (personnelOptional.isPresent()){
            Personnel personnel = personnelOptional.get();
            personnel.setActive(false);
            personnelRepository.save(personnel);
        }*/


        //PERSONELİN ÇALIŞMA DURUMUNU FALSE YAP
        setPersonnelActiveState(personnelBlacklistRequestDto.getPersonnel().getId(),false);



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

        //KARA LİSTEDEN KALDIRILAN PERSONELİN ÇALIŞMA DURUMUNU TRUE YAP
        Optional<PersonnelBlacklist> personnelBlacklistOptional = personnelBlacklistRepository.findById(id);
        if(personnelBlacklistOptional.isPresent()){
            PersonnelBlacklist personnelBlacklist = personnelBlacklistOptional.get();
            setPersonnelActiveState(personnelBlacklist.getPersonnel().getId(),true);
        }


        personnelBlacklistRepository.deleteById(id);


        //PERSONNELİN ÇALIŞMA DURUMUNU TRUE YAP
        Optional<Personnel> personnelOptional = personnelRepository.findById(id);
        if (personnelOptional.isPresent()){
            Personnel personnel = personnelOptional.get();
            personnel.setActive(true);
            personnelRepository.save(personnel);
        }

    }

    @Override
    public void setPersonnelActiveState(Long personnelId, boolean isActive) {
        //PERSONELİN ÇALIŞMA DURUMUNU DEGİSTİR
        Optional<Personnel> personnelOptional = personnelRepository.findById(personnelId);
        if (personnelOptional.isPresent()){
            Personnel personnel = personnelOptional.get();
            personnel.setActive(isActive);
            personnelRepository.save(personnel);
        }

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
