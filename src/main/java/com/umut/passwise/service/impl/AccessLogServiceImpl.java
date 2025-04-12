package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.AccessLogRequestDto;
import com.umut.passwise.dto.responses.AccessLogResponseDto;
import com.umut.passwise.entities.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.repository.AccessLogRepository;
import com.umut.passwise.service.abstracts.IAccessLogService;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AccessLogServiceImpl implements IAccessLogService {

    private final AccessLogRepository accessLogRepository;

    @Autowired
    public AccessLogServiceImpl(AccessLogRepository accessLogRepository) {
        this.accessLogRepository = accessLogRepository;
    }

    @Override
    public List<AccessLogResponseDto> findAll() {
        List<AccessLog> accessLoglist = accessLogRepository.findAll();
        List<AccessLogResponseDto> dtoList = new ArrayList<>();

        for(AccessLog accessLog: accessLoglist){
            AccessLogResponseDto dto = new AccessLogResponseDto();
            BeanUtils.copyProperties(accessLog, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<AccessLogResponseDto> findById(Long id) {
        Optional<AccessLog> accessLog = accessLogRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (accessLog.isPresent()) {
            AccessLogResponseDto dto = new AccessLogResponseDto();
            BeanUtils.copyProperties(accessLog.get(), dto);  // accessLog.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public AccessLogResponseDto save(AccessLogRequestDto accessLogRequestDto) {
        AccessLog accessLog = new AccessLog();
        AccessLogResponseDto accessLogResponseDto = new AccessLogResponseDto();

        BeanUtils.copyProperties(accessLogRequestDto, accessLog);

        accessLogRepository.save(accessLog);

        BeanUtils.copyProperties(accessLog, accessLogResponseDto);

        return accessLogResponseDto;
    }

    @Override
    public AccessLogResponseDto update(Long id, AccessLogRequestDto accessLogRequestDto) {
        // Mevcut entity'yi bul
        Optional<AccessLog> accessLogOptional = accessLogRepository.findById(id);

        if (accessLogOptional.isPresent()) {
            AccessLog accessLog = accessLogOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(accessLogRequestDto, accessLog);

            // Güncellenmiş entity'yi kaydet
            accessLogRepository.save(accessLog);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            AccessLogResponseDto accessLogResponseDto = new AccessLogResponseDto();
            BeanUtils.copyProperties(accessLog, accessLogResponseDto);

            return accessLogResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("AccessLog with ID " + id + " not found");
        }
    }

    public AccessLogResponseDto createAccessLog(Personnel personnel, Card card, Door door,
                                                 AccessMethod accessMethod, AccessResult accessResult, String details) {

        AccessLog accessLog = new AccessLog();
        accessLog.setPersonnel(personnel);
        accessLog.setCard(card);
        accessLog.setDoor(door);
        accessLog.setAccessTimestamp(Timestamp.from(Instant.now()));
        accessLog.setAccessMethod(accessMethod);
        accessLog.setAccessResult(accessResult);
        accessLog.setDetails(details);

        AccessLog savedLog = accessLogRepository.save(accessLog);

        AccessLogResponseDto responseDto = new AccessLogResponseDto();
        BeanUtils.copyProperties(savedLog, responseDto);

        return responseDto;
    }

    @Override
    public void deleteById(Long id) {
        accessLogRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return accessLogRepository.existsById(id);
    }
}
