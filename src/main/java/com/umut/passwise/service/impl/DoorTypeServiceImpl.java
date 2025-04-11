package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.DoorTypeRequestDto;
import com.umut.passwise.dto.responses.DoorTypeResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.DoorType;
import com.umut.passwise.repository.DoorTypeRepository;
import com.umut.passwise.service.abstracts.IDoorTypeService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DoorTypeServiceImpl implements IDoorTypeService {

    private final DoorTypeRepository doorTypeRepository;

    @Autowired
    public DoorTypeServiceImpl(DoorTypeRepository doorTypeRepository) {
        this.doorTypeRepository = doorTypeRepository;
    }

    @Override
    public List<DoorTypeResponseDto> findAll() {
        List<DoorType> doorTypelist = doorTypeRepository.findAll();
        List<DoorTypeResponseDto> dtoList = new ArrayList<>();

        for(DoorType doorType: doorTypelist){
            DoorTypeResponseDto dto = new DoorTypeResponseDto();
            BeanUtils.copyProperties(doorType, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<DoorTypeResponseDto> findById(Long id) {
        Optional<DoorType> doorType = doorTypeRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (doorType.isPresent()) {
            DoorTypeResponseDto dto = new DoorTypeResponseDto();
            BeanUtils.copyProperties(doorType.get(), dto);  // doorType.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public DoorTypeResponseDto save(DoorTypeRequestDto doorTypeRequestDto) {
        DoorType doorType = new DoorType();
        DoorTypeResponseDto doorTypeResponseDto = new DoorTypeResponseDto();

        BeanUtils.copyProperties(doorTypeRequestDto, doorType);

        doorTypeRepository.save(doorType);

        BeanUtils.copyProperties(doorType, doorTypeResponseDto);

        return doorTypeResponseDto;
    }

    @Override
    public DoorTypeResponseDto update(Long id, DoorTypeRequestDto doorTypeRequestDto) {
        // Mevcut entity'yi bul
        Optional<DoorType> doorTypeOptional = doorTypeRepository.findById(id);

        if (doorTypeOptional.isPresent()) {
            DoorType doorType = doorTypeOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(doorTypeRequestDto, doorType);

            // Güncellenmiş entity'yi kaydet
            doorTypeRepository.save(doorType);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            DoorTypeResponseDto doorTypeResponseDto = new DoorTypeResponseDto();
            BeanUtils.copyProperties(doorType, doorTypeResponseDto);

            return doorTypeResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("DoorType with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        doorTypeRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return doorTypeRepository.existsById(id);
    }
}
