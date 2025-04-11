package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.AccessDirectionRequestDto;
import com.umut.passwise.dto.responses.AccessDirectionResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.AccessDirection;
import com.umut.passwise.repository.AccessDirectionRepository;
import com.umut.passwise.service.abstracts.IAccessDirectionService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AccessDirectionServiceImpl implements IAccessDirectionService {

    private final AccessDirectionRepository accessDirectionRepository;

    @Autowired
    public AccessDirectionServiceImpl(AccessDirectionRepository accessDirectionRepository) {
        this.accessDirectionRepository = accessDirectionRepository;
    }

    @Override
    public List<AccessDirectionResponseDto> findAll() {
        List<AccessDirection> accessDirectionlist = accessDirectionRepository.findAll();
        List<AccessDirectionResponseDto> dtoList = new ArrayList<>();

        for(AccessDirection accessDirection: accessDirectionlist){
            AccessDirectionResponseDto dto = new AccessDirectionResponseDto();
            BeanUtils.copyProperties(accessDirection, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<AccessDirectionResponseDto> findById(Long id) {
        Optional<AccessDirection> accessDirection = accessDirectionRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (accessDirection.isPresent()) {
            AccessDirectionResponseDto dto = new AccessDirectionResponseDto();
            BeanUtils.copyProperties(accessDirection.get(), dto);  // accessDirection.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public AccessDirectionResponseDto save(AccessDirectionRequestDto accessDirectionRequestDto) {
        AccessDirection accessDirection = new AccessDirection();
        AccessDirectionResponseDto accessDirectionResponseDto = new AccessDirectionResponseDto();

        BeanUtils.copyProperties(accessDirectionRequestDto, accessDirection);

        accessDirectionRepository.save(accessDirection);

        BeanUtils.copyProperties(accessDirection, accessDirectionResponseDto);

        return accessDirectionResponseDto;
    }

    @Override
    public AccessDirectionResponseDto update(Long id, AccessDirectionRequestDto accessDirectionRequestDto) {
        // Mevcut entity'yi bul
        Optional<AccessDirection> accessDirectionOptional = accessDirectionRepository.findById(id);

        if (accessDirectionOptional.isPresent()) {
            AccessDirection accessDirection = accessDirectionOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(accessDirectionRequestDto, accessDirection);

            // Güncellenmiş entity'yi kaydet
            accessDirectionRepository.save(accessDirection);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            AccessDirectionResponseDto accessDirectionResponseDto = new AccessDirectionResponseDto();
            BeanUtils.copyProperties(accessDirection, accessDirectionResponseDto);

            return accessDirectionResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("AccessDirection with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        accessDirectionRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return accessDirectionRepository.existsById(id);
    }
}
