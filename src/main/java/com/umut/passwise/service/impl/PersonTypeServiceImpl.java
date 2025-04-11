package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.PersonTypeRequestDto;
import com.umut.passwise.dto.responses.PersonTypeResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.PersonType;
import com.umut.passwise.repository.PersonTypeRepository;
import com.umut.passwise.service.abstracts.IPersonTypeService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PersonTypeServiceImpl implements IPersonTypeService {

    private final PersonTypeRepository personTypeRepository;

    @Autowired
    public PersonTypeServiceImpl(PersonTypeRepository personTypeRepository) {
        this.personTypeRepository = personTypeRepository;
    }

    @Override
    public List<PersonTypeResponseDto> findAll() {
        List<PersonType> personTypelist = personTypeRepository.findAll();
        List<PersonTypeResponseDto> dtoList = new ArrayList<>();

        for(PersonType personType: personTypelist){
            PersonTypeResponseDto dto = new PersonTypeResponseDto();
            BeanUtils.copyProperties(personType, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<PersonTypeResponseDto> findById(Long id) {
        Optional<PersonType> personType = personTypeRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (personType.isPresent()) {
            PersonTypeResponseDto dto = new PersonTypeResponseDto();
            BeanUtils.copyProperties(personType.get(), dto);  // personType.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public PersonTypeResponseDto save(PersonTypeRequestDto personTypeRequestDto) {
        PersonType personType = new PersonType();
        PersonTypeResponseDto personTypeResponseDto = new PersonTypeResponseDto();

        BeanUtils.copyProperties(personTypeRequestDto, personType);

        personTypeRepository.save(personType);

        BeanUtils.copyProperties(personType, personTypeResponseDto);

        return personTypeResponseDto;
    }

    @Override
    public PersonTypeResponseDto update(Long id, PersonTypeRequestDto personTypeRequestDto) {
        // Mevcut entity'yi bul
        Optional<PersonType> personTypeOptional = personTypeRepository.findById(id);

        if (personTypeOptional.isPresent()) {
            PersonType personType = personTypeOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(personTypeRequestDto, personType);

            // Güncellenmiş entity'yi kaydet
            personTypeRepository.save(personType);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            PersonTypeResponseDto personTypeResponseDto = new PersonTypeResponseDto();
            BeanUtils.copyProperties(personType, personTypeResponseDto);

            return personTypeResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("PersonType with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        personTypeRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personTypeRepository.existsById(id);
    }
}
