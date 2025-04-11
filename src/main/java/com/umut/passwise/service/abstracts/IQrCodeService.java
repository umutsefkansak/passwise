package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.QrCodeRequestDto;
import com.umut.passwise.dto.responses.QrCodeResponseDto;

public interface IQrCodeService {

    List<QrCodeResponseDto> findAll();

    Optional<QrCodeResponseDto> findById(Long id);

    QrCodeResponseDto save(QrCodeRequestDto qrCodeRequestDto);

    QrCodeResponseDto update(Long id, QrCodeRequestDto qrCodeRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);
}
