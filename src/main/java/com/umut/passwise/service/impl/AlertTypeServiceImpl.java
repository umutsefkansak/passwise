package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.AlertTypeRequestDto;
import com.umut.passwise.dto.responses.AlertTypeResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.AlertType;
import com.umut.passwise.repository.AlertTypeRepository;
import com.umut.passwise.service.abstracts.IAlertTypeService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AlertTypeServiceImpl implements IAlertTypeService {

    private final AlertTypeRepository alertTypeRepository;

    @Autowired
    public AlertTypeServiceImpl(AlertTypeRepository alertTypeRepository) {
        this.alertTypeRepository = alertTypeRepository;
    }

    @Override
    public List<AlertTypeResponseDto> findAll() {
        List<AlertType> alertTypelist = alertTypeRepository.findAll();
        List<AlertTypeResponseDto> dtoList = new ArrayList<>();

        for(AlertType alertType: alertTypelist){
            AlertTypeResponseDto dto = new AlertTypeResponseDto();
            BeanUtils.copyProperties(alertType, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<AlertTypeResponseDto> findById(Long id) {
        Optional<AlertType> alertType = alertTypeRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (alertType.isPresent()) {
            AlertTypeResponseDto dto = new AlertTypeResponseDto();
            BeanUtils.copyProperties(alertType.get(), dto);  // alertType.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public AlertTypeResponseDto save(AlertTypeRequestDto alertTypeRequestDto) {
        AlertType alertType = new AlertType();
        AlertTypeResponseDto alertTypeResponseDto = new AlertTypeResponseDto();

        BeanUtils.copyProperties(alertTypeRequestDto, alertType);

        alertTypeRepository.save(alertType);

        BeanUtils.copyProperties(alertType, alertTypeResponseDto);

        return alertTypeResponseDto;
    }

    @Override
    public AlertTypeResponseDto update(Long id, AlertTypeRequestDto alertTypeRequestDto) {
        // Mevcut entity'yi bul
        Optional<AlertType> alertTypeOptional = alertTypeRepository.findById(id);

        if (alertTypeOptional.isPresent()) {
            AlertType alertType = alertTypeOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(alertTypeRequestDto, alertType);

            // Güncellenmiş entity'yi kaydet
            alertTypeRepository.save(alertType);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            AlertTypeResponseDto alertTypeResponseDto = new AlertTypeResponseDto();
            BeanUtils.copyProperties(alertType, alertTypeResponseDto);

            return alertTypeResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("AlertType with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        alertTypeRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return alertTypeRepository.existsById(id);
    }
}
