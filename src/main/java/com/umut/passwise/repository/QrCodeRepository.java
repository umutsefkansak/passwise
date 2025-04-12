package com.umut.passwise.repository;

import com.umut.passwise.entities.QrCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QrCodeRepository extends JpaRepository<QrCode,Long> {


    Optional<QrCode> findByCode(String qrCodeContent);
}
