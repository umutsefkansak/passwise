package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.DoorRequestDto;
import com.umut.passwise.dto.responses.DoorResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.Door;
import com.umut.passwise.repository.DoorRepository;
import com.umut.passwise.service.abstracts.IDoorService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DoorServiceImpl implements IDoorService {

    private final DoorRepository doorRepository;

    @Autowired
    public DoorServiceImpl(DoorRepository doorRepository) {
        this.doorRepository = doorRepository;
    }

    @Override
    public List<DoorResponseDto> findAll() {
        List<Door> doorlist = doorRepository.findAll();
        List<DoorResponseDto> dtoList = new ArrayList<>();

        for(Door door: doorlist){
            DoorResponseDto dto = new DoorResponseDto();
            BeanUtils.copyProperties(door, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<DoorResponseDto> findById(Long id) {
        Optional<Door> door = doorRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (door.isPresent()) {
            DoorResponseDto dto = new DoorResponseDto();
            BeanUtils.copyProperties(door.get(), dto);  // door.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public DoorResponseDto save(DoorRequestDto doorRequestDto) {
        Door door = new Door();
        DoorResponseDto doorResponseDto = new DoorResponseDto();

        BeanUtils.copyProperties(doorRequestDto, door);

        doorRepository.save(door);

        BeanUtils.copyProperties(door, doorResponseDto);

        return doorResponseDto;
    }

    @Override
    public DoorResponseDto update(Long id, DoorRequestDto doorRequestDto) {
        // Mevcut entity'yi bul
        Optional<Door> doorOptional = doorRepository.findById(id);

        if (doorOptional.isPresent()) {
            Door door = doorOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(doorRequestDto, door);

            // Güncellenmiş entity'yi kaydet
            doorRepository.save(door);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            DoorResponseDto doorResponseDto = new DoorResponseDto();
            BeanUtils.copyProperties(door, doorResponseDto);

            return doorResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("Door with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        doorRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return doorRepository.existsById(id);
    }
}
