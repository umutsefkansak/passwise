package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.AccessResultRequestDto;
import com.umut.passwise.dto.responses.AccessResultResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.AccessResult;
import com.umut.passwise.repository.AccessResultRepository;
import com.umut.passwise.service.abstracts.IAccessResultService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AccessResultServiceImpl implements IAccessResultService {

    private final AccessResultRepository accessResultRepository;

    @Autowired
    public AccessResultServiceImpl(AccessResultRepository accessResultRepository) {
        this.accessResultRepository = accessResultRepository;
    }

    @Override
    public List<AccessResultResponseDto> findAll() {
        List<AccessResult> accessResultlist = accessResultRepository.findAll();
        List<AccessResultResponseDto> dtoList = new ArrayList<>();

        for(AccessResult accessResult: accessResultlist){
            AccessResultResponseDto dto = new AccessResultResponseDto();
            BeanUtils.copyProperties(accessResult, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<AccessResultResponseDto> findById(Long id) {
        Optional<AccessResult> accessResult = accessResultRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (accessResult.isPresent()) {
            AccessResultResponseDto dto = new AccessResultResponseDto();
            BeanUtils.copyProperties(accessResult.get(), dto);  // accessResult.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public AccessResultResponseDto save(AccessResultRequestDto accessResultRequestDto) {
        AccessResult accessResult = new AccessResult();
        AccessResultResponseDto accessResultResponseDto = new AccessResultResponseDto();

        BeanUtils.copyProperties(accessResultRequestDto, accessResult);

        accessResultRepository.save(accessResult);

        BeanUtils.copyProperties(accessResult, accessResultResponseDto);

        return accessResultResponseDto;
    }

    @Override
    public AccessResultResponseDto update(Long id, AccessResultRequestDto accessResultRequestDto) {
        // Mevcut entity'yi bul
        Optional<AccessResult> accessResultOptional = accessResultRepository.findById(id);

        if (accessResultOptional.isPresent()) {
            AccessResult accessResult = accessResultOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(accessResultRequestDto, accessResult);

            // Güncellenmiş entity'yi kaydet
            accessResultRepository.save(accessResult);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            AccessResultResponseDto accessResultResponseDto = new AccessResultResponseDto();
            BeanUtils.copyProperties(accessResult, accessResultResponseDto);

            return accessResultResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("AccessResult with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        accessResultRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return accessResultRepository.existsById(id);
    }
}
