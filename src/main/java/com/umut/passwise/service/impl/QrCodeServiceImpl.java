package com.umut.passwise.service.impl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.QrCode;
import com.umut.passwise.repository.QrCodeRepository;
import com.umut.passwise.service.abstracts.IQrCodeService;

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
    public List<QrCode> findAll() {
        return qrCodeRepository.findAll();
    }

    @Override
    public Optional<QrCode> findById(Long id) {
        return qrCodeRepository.findById(id);
    }

    @Override
    public QrCode save(QrCode qrCode) {
        return qrCodeRepository.save(qrCode);
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
