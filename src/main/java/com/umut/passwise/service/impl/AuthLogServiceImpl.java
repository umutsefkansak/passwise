package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.AuthLogRequestDto;
import com.umut.passwise.dto.responses.AuthLogResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.AuthLog;
import com.umut.passwise.repository.AuthLogRepository;
import com.umut.passwise.service.abstracts.IAuthLogService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AuthLogServiceImpl implements IAuthLogService {

    private final AuthLogRepository authLogRepository;

    @Autowired
    public AuthLogServiceImpl(AuthLogRepository authLogRepository) {
        this.authLogRepository = authLogRepository;
    }

    @Override
    public List<AuthLogResponseDto> findAll() {
        List<AuthLog> authLoglist = authLogRepository.findAll();
        List<AuthLogResponseDto> dtoList = new ArrayList<>();

        for(AuthLog authLog: authLoglist){
            AuthLogResponseDto dto = new AuthLogResponseDto();
            BeanUtils.copyProperties(authLog, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<AuthLogResponseDto> findById(Long id) {
        Optional<AuthLog> authLog = authLogRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (authLog.isPresent()) {
            AuthLogResponseDto dto = new AuthLogResponseDto();
            BeanUtils.copyProperties(authLog.get(), dto);  // authLog.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public AuthLogResponseDto save(AuthLogRequestDto authLogRequestDto) {
        AuthLog authLog = new AuthLog();
        AuthLogResponseDto authLogResponseDto = new AuthLogResponseDto();

        BeanUtils.copyProperties(authLogRequestDto, authLog);

        authLogRepository.save(authLog);

        BeanUtils.copyProperties(authLog, authLogResponseDto);

        return authLogResponseDto;
    }

    @Override
    public AuthLogResponseDto update(Long id, AuthLogRequestDto authLogRequestDto) {
        // Mevcut entity'yi bul
        Optional<AuthLog> authLogOptional = authLogRepository.findById(id);

        if (authLogOptional.isPresent()) {
            AuthLog authLog = authLogOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(authLogRequestDto, authLog);

            // Güncellenmiş entity'yi kaydet
            authLogRepository.save(authLog);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            AuthLogResponseDto authLogResponseDto = new AuthLogResponseDto();
            BeanUtils.copyProperties(authLog, authLogResponseDto);

            return authLogResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("AuthLog with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        authLogRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return authLogRepository.existsById(id);
    }
}
