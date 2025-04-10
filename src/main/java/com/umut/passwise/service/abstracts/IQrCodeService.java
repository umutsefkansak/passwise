package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;
import com.umut.passwise.entities.QrCode;

public interface IQrCodeService {

    List<QrCode> findAll();

    Optional<QrCode> findById(Long id);

    QrCode save(QrCode qrCode);

    void deleteById(Long id);

    boolean existsById(Long id);
}
