package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.AccessMethodRequestDto;
import com.umut.passwise.dto.responses.AccessMethodResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.AccessMethod;
import com.umut.passwise.repository.AccessMethodRepository;
import com.umut.passwise.service.abstracts.IAccessMethodService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AccessMethodServiceImpl implements IAccessMethodService {

    private final AccessMethodRepository accessMethodRepository;

    @Autowired
    public AccessMethodServiceImpl(AccessMethodRepository accessMethodRepository) {
        this.accessMethodRepository = accessMethodRepository;
    }

    @Override
    public List<AccessMethodResponseDto> findAll() {
        List<AccessMethod> accessMethodlist = accessMethodRepository.findAll();
        List<AccessMethodResponseDto> dtoList = new ArrayList<>();

        for(AccessMethod accessMethod: accessMethodlist){
            AccessMethodResponseDto dto = new AccessMethodResponseDto();
            BeanUtils.copyProperties(accessMethod, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<AccessMethodResponseDto> findById(Long id) {
        Optional<AccessMethod> accessMethod = accessMethodRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (accessMethod.isPresent()) {
            AccessMethodResponseDto dto = new AccessMethodResponseDto();
            BeanUtils.copyProperties(accessMethod.get(), dto);  // accessMethod.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public AccessMethodResponseDto save(AccessMethodRequestDto accessMethodRequestDto) {
        AccessMethod accessMethod = new AccessMethod();
        AccessMethodResponseDto accessMethodResponseDto = new AccessMethodResponseDto();

        BeanUtils.copyProperties(accessMethodRequestDto, accessMethod);

        accessMethodRepository.save(accessMethod);

        BeanUtils.copyProperties(accessMethod, accessMethodResponseDto);

        return accessMethodResponseDto;
    }

    @Override
    public AccessMethodResponseDto update(Long id, AccessMethodRequestDto accessMethodRequestDto) {
        // Mevcut entity'yi bul
        Optional<AccessMethod> accessMethodOptional = accessMethodRepository.findById(id);

        if (accessMethodOptional.isPresent()) {
            AccessMethod accessMethod = accessMethodOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(accessMethodRequestDto, accessMethod);

            // Güncellenmiş entity'yi kaydet
            accessMethodRepository.save(accessMethod);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            AccessMethodResponseDto accessMethodResponseDto = new AccessMethodResponseDto();
            BeanUtils.copyProperties(accessMethod, accessMethodResponseDto);

            return accessMethodResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("AccessMethod with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        accessMethodRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return accessMethodRepository.existsById(id);
    }
}
