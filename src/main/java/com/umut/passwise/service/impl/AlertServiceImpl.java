package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.AlertRequestDto;
import com.umut.passwise.dto.responses.AlertResponseDto;
import com.umut.passwise.entities.AlertType;
import com.umut.passwise.entities.Door;
import com.umut.passwise.entities.Personnel;
import com.umut.passwise.repository.AlertTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.Alert;
import com.umut.passwise.repository.AlertRepository;
import com.umut.passwise.service.abstracts.IAlertService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AlertServiceImpl implements IAlertService {

    private final AlertRepository alertRepository;
    private final AlertTypeRepository alertTypeRepository;

    @Autowired
    public AlertServiceImpl(AlertRepository alertRepository, AlertTypeRepository alertTypeRepository) {
        this.alertRepository = alertRepository;
        this.alertTypeRepository = alertTypeRepository;
    }

    @Override
    public List<AlertResponseDto> findAll() {
        List<Alert> alertlist = alertRepository.findAll();
        List<AlertResponseDto> dtoList = new ArrayList<>();

        for(Alert alert: alertlist){
            AlertResponseDto dto = new AlertResponseDto();
            BeanUtils.copyProperties(alert, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<AlertResponseDto> findById(Long id) {
        Optional<Alert> alert = alertRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (alert.isPresent()) {
            AlertResponseDto dto = new AlertResponseDto();
            BeanUtils.copyProperties(alert.get(), dto);  // alert.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public AlertResponseDto save(AlertRequestDto alertRequestDto) {
        Alert alert = new Alert();
        AlertResponseDto alertResponseDto = new AlertResponseDto();

        BeanUtils.copyProperties(alertRequestDto, alert);

        alertRepository.save(alert);

        BeanUtils.copyProperties(alert, alertResponseDto);

        return alertResponseDto;
    }

    @Override
    public AlertResponseDto update(Long id, AlertRequestDto alertRequestDto) {
        // Mevcut entity'yi bul
        Optional<Alert> alertOptional = alertRepository.findById(id);

        if (alertOptional.isPresent()) {
            Alert alert = alertOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(alertRequestDto, alert);

            // Güncellenmiş entity'yi kaydet
            alertRepository.save(alert);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            AlertResponseDto alertResponseDto = new AlertResponseDto();
            BeanUtils.copyProperties(alert, alertResponseDto);

            return alertResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("Alert with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        alertRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return alertRepository.existsById(id);
    }


    @Override
    public void createUnauthorizedAccessAlert(Personnel personnel, Door door) {
        AlertType unauthorizedAccessAlertType = alertTypeRepository.findByName("YETKİSİZ ERİŞİM")
                .orElseThrow(() -> new RuntimeException("Yetkisiz erişim alarm tipi bulunamadı"));

        Alert alert = new Alert();
        alert.setPersonnel(personnel);
        alert.setDoor(door);
        alert.setAlertType(unauthorizedAccessAlertType);
        alert.setAlertMessage(personnel.getName() + " " + personnel.getSurname() +
                " yetkisiz erişim denemesi: " + door.getName());
        alert.setIsResolved(false);

        alertRepository.save(alert);
    }
}
