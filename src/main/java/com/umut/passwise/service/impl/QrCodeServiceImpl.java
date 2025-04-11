package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.QrCodeRequestDto;
import com.umut.passwise.dto.responses.QrCodeResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.QrCode;
import com.umut.passwise.repository.QrCodeRepository;
import com.umut.passwise.service.abstracts.IQrCodeService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class QrCodeServiceImpl implements IQrCodeService {

    private final QrCodeRepository qrCodeRepository;

    @Autowired
    public QrCodeServiceImpl(QrCodeRepository qrCodeRepository) {
        this.qrCodeRepository = qrCodeRepository;
    }

    @Override
    public List<QrCodeResponseDto> findAll() {
        List<QrCode> qrCodelist = qrCodeRepository.findAll();
        List<QrCodeResponseDto> dtoList = new ArrayList<>();

        for(QrCode qrCode: qrCodelist){
            QrCodeResponseDto dto = new QrCodeResponseDto();
            BeanUtils.copyProperties(qrCode, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<QrCodeResponseDto> findById(Long id) {
        Optional<QrCode> qrCode = qrCodeRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (qrCode.isPresent()) {
            QrCodeResponseDto dto = new QrCodeResponseDto();
            BeanUtils.copyProperties(qrCode.get(), dto);  // qrCode.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public QrCodeResponseDto save(QrCodeRequestDto qrCodeRequestDto) {
        QrCode qrCode = new QrCode();
        QrCodeResponseDto qrCodeResponseDto = new QrCodeResponseDto();

        BeanUtils.copyProperties(qrCodeRequestDto, qrCode);

        qrCodeRepository.save(qrCode);

        BeanUtils.copyProperties(qrCode, qrCodeResponseDto);

        return qrCodeResponseDto;
    }

    @Override
    public QrCodeResponseDto update(Long id, QrCodeRequestDto qrCodeRequestDto) {
        // Mevcut entity'yi bul
        Optional<QrCode> qrCodeOptional = qrCodeRepository.findById(id);

        if (qrCodeOptional.isPresent()) {
            QrCode qrCode = qrCodeOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(qrCodeRequestDto, qrCode);

            // Güncellenmiş entity'yi kaydet
            qrCodeRepository.save(qrCode);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            QrCodeResponseDto qrCodeResponseDto = new QrCodeResponseDto();
            BeanUtils.copyProperties(qrCode, qrCodeResponseDto);

            return qrCodeResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("QrCode with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        qrCodeRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return qrCodeRepository.existsById(id);
    }
}
