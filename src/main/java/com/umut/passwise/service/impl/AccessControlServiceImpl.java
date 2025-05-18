/*
BAZI YERLERDE REPOSITORY BAZI YERLERDE SERVİCE KULLANILMASININ SEBEBİ
Şu anki durumda, erişim kontrolü gibi hızlı ve kritik bir işlem için,
mevcut yapı (repository doğrudan kullanımı) daha uygundur.

Karmaşık iş mantığı için servisler kullanılıyor

Kapı, kart ve personel gibi temel entity arama işlemleri için doğrudan repository'ler kullanılıyor

Her şeyi servis katmanına taşımak bazen gereksiz karmaşıklığa ve performans kaybına yol açabilir.

*/


package com.umut.passwise.service.impl;

import com.umut.passwise.dto.requests.CardAccessRequestDto;
import com.umut.passwise.dto.requests.QrCodeAccessRequestDto;
import com.umut.passwise.dto.responses.AccessLogResponseDto;
import com.umut.passwise.entities.*;
import com.umut.passwise.repository.*;
import com.umut.passwise.service.abstracts.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AccessControlServiceImpl implements IAccessControlService {

    private final IPersonnelPermissionService personnelPermissionService;
    private final IPersonnelPermissionGroupService personnelPermissionGroupService;
    private final IAccessLogService accessLogService;
    private final CardRepository cardRepository;
    private final CardBlacklistRepository cardBlacklistRepository;
    private final PersonnelBlacklistRepository personnelBlacklistRepository;
    private final AccessMethodRepository accessMethodRepository;
    private final AccessResultRepository accessResultRepository;
    private final PersonnelRepository personnelRepository;
    private final DoorRepository doorRepository;
    private final IAlertService alertService;
    private final QrCodeRepository qrCodeRepository;

    @Autowired
    public AccessControlServiceImpl(
            IAccessLogService accessLogService, CardRepository cardRepository,
            CardBlacklistRepository cardBlacklistRepository,
            PersonnelBlacklistRepository personnelBlacklistRepository,
            IPersonnelPermissionService personnelPermissionService,
            IPersonnelPermissionGroupService personnelPermissionGroupService,
            AccessMethodRepository accessMethodRepository,
            AccessResultRepository accessResultRepository, PersonnelRepository personnelRepository,
            DoorRepository doorRepository,
            IAlertService alertService, QrCodeRepository qrCodeRepository) {
        this.accessLogService = accessLogService;
        this.cardRepository = cardRepository;
        this.cardBlacklistRepository = cardBlacklistRepository;
        this.personnelBlacklistRepository = personnelBlacklistRepository;
        this.personnelPermissionService = personnelPermissionService;
        this.personnelPermissionGroupService = personnelPermissionGroupService;
        this.accessMethodRepository = accessMethodRepository;
        this.accessResultRepository = accessResultRepository;
        this.personnelRepository = personnelRepository;
        this.doorRepository = doorRepository;
        this.alertService = alertService;
        this.qrCodeRepository = qrCodeRepository;
    }

    @Transactional
    public AccessLogResponseDto processCardAccess(CardAccessRequestDto requestDto) {
        String cardNumber = requestDto.getCardNumber();
        System.out.println("------------card nı:"+cardNumber);
        Long doorId = requestDto.getDoorId();

        // Varsayılan olarak "KART" erişim yöntemini kullan
        AccessMethod cardAccessMethod = accessMethodRepository.findByName("KART")
                .orElseThrow(() -> new RuntimeException("Kart erişim yöntemi bulunamadı"));

        // Erişim sonucunu başlangıçta "REDDEDILDI" olarak ayarla
        AccessResult deniedResult = accessResultRepository.findByName("REDDEDILDI")
                .orElseThrow(() -> new RuntimeException("Reddedildi erişim sonucu bulunamadı"));

        AccessResult accessResult = deniedResult;
        String details = "Erişim reddedildi: ";

        // Kapıyı bul
        Door door = doorRepository.findById(doorId)
                .orElseThrow(() -> new RuntimeException("Kapı bulunamadı: " + doorId));

        // Kart kontrolü
        Optional<Card> cardOptional = cardRepository.findByCardNumber(cardNumber);
        if (cardOptional.isEmpty()) {
            details += "Geçersiz kart.";
            return accessLogService.createAccessLog(null, null, door, cardAccessMethod, deniedResult, details);
        }

        Card card = cardOptional.get();

        // Kartın aktif olup olmadığını kontrol et
        if (!card.getActive()) {
            details += "Kart aktif değil.";
            return accessLogService.createAccessLog(null, card, door, cardAccessMethod, deniedResult, details);
        }

        // Kartın kara listede olup olmadığını kontrol et
        if (cardBlacklistRepository.existsByCard(card)) {
            details += "Kart kara listede.";
            return accessLogService.createAccessLog(null, card, door, cardAccessMethod, deniedResult, details);
        }

        // Personeli bul
        Personnel personnel = card.getPersonel();
        if (personnel == null) {
            details += "Kart herhangi bir personele atanmamış.";
            return accessLogService.createAccessLog(null, card, door, cardAccessMethod, deniedResult, details);
        }

        // Personelin aktif olup olmadığını kontrol et
        if (!personnel.isActive()) {
            details += "Personel aktif değil.";
            return accessLogService.createAccessLog(personnel, card, door, cardAccessMethod, deniedResult, details);
        }

        // Personelin kara listede olup olmadığını kontrol et
        if (personnelBlacklistRepository.existsByPersonnel(personnel)) {
            details += "Personel kara listede.";
            return accessLogService.createAccessLog(personnel, card, door, cardAccessMethod, deniedResult, details);
        }

        // Direkt kapı yetkisini kontrol et
        boolean hasDirectPermission = personnelPermissionService.existsByPersonnelAndDoor(personnel, door);

        // Dolaylı kapı yetkisini kontrol et (yetki grupları üzerinden)
        boolean hasIndirectPermission = false;
        if (!hasDirectPermission) {
            hasIndirectPermission = personnelPermissionGroupService.hasIndirectPermission(personnel,doorId);
        }

        // Erişim sonucunu belirle
        if (hasDirectPermission || hasIndirectPermission) {
            AccessResult approvedResult = accessResultRepository.findByName("ONAYLANDI")
                    .orElseThrow(() -> new RuntimeException("Onaylandı erişim sonucu bulunamadı"));
            accessResult = approvedResult;
            details = "Erişim onaylandı: " + (hasDirectPermission ? "Doğrudan yetki." : "Grup yetkisi.");
        } else {
            details += "Personelin kapıya erişim yetkisi yok.";

            // Yetkisiz erişim denemesi için bir alarm oluştur
            alertService.createUnauthorizedAccessAlert(personnel, door);
        }

        // Erişim kaydı oluştur ve dön
        return accessLogService.createAccessLog(personnel, card, door, cardAccessMethod, accessResult, details);
    }


    @Transactional
    public AccessLogResponseDto processQrCodeAccess(QrCodeAccessRequestDto requestDto) {
        String qrCodeContent = requestDto.getQrCodeContent();
        Long personnelId = requestDto.getScanningPersonnelId();

        // QR kod içeriğini kullanarak doğru QR kod kaydını bul
        Optional<QrCode> qrCodeOptional = qrCodeRepository.findByCode(qrCodeContent);

        // Varsayılan olarak "QR" erişim yöntemini kullan
        AccessMethod qrAccessMethod = accessMethodRepository.findByName("QR_KOD")
                .orElseThrow(() -> new RuntimeException("QR Kod erişim yöntemi bulunamadı"));

        // Erişim sonucunu başlangıçta "REDDEDILDI" olarak ayarla
        AccessResult deniedResult = accessResultRepository.findByName("REDDEDILDI")
                .orElseThrow(() -> new RuntimeException("Reddedildi erişim sonucu bulunamadı"));

        AccessResult accessResult = deniedResult;
        String details = "Erişim reddedildi: ";

        // QR Kod kontrolü
        if (qrCodeOptional.isEmpty()) {
            details += "Geçersiz QR kod.";
            return accessLogService.createAccessLog(null, null, null, qrAccessMethod, deniedResult, details);
        }

        QrCode qrCode = qrCodeOptional.get();
        Door door = qrCode.getDoor();

        // Personel kontrolü
        Personnel scanningPersonnel = null;
        if (personnelId != null) {
            scanningPersonnel = personnelRepository.findById(personnelId)
                    .orElse(null);
        }

        if (scanningPersonnel == null) {
            details += "Personel bilgisi bulunamadı.";
            return accessLogService.createAccessLog(null, null, door, qrAccessMethod, deniedResult, details);
        }

        // Personelin aktif olup olmadığını kontrol et
        if (!scanningPersonnel.isActive()) {
            details += "Personel aktif değil.";
            return accessLogService.createAccessLog(scanningPersonnel, null, door, qrAccessMethod, deniedResult, details);
        }

        // Personelin kara listede olup olmadığını kontrol et
        if (personnelBlacklistRepository.existsByPersonnel(scanningPersonnel)) {
            details += "Personel kara listede.";
            return accessLogService.createAccessLog(scanningPersonnel, null, door, qrAccessMethod, deniedResult, details);
        }

        // Direkt kapı yetkisini kontrol et
        boolean hasDirectPermission = personnelPermissionService.existsByPersonnelAndDoor(scanningPersonnel, door);

        // Dolaylı kapı yetkisini kontrol et (yetki grupları üzerinden)
        boolean hasIndirectPermission = false;
        if (!hasDirectPermission) {
            hasIndirectPermission = personnelPermissionGroupService.hasIndirectPermission(scanningPersonnel, door.getId());
        }

        // Erişim sonucunu belirle
        if (hasDirectPermission || hasIndirectPermission) {
            AccessResult approvedResult = accessResultRepository.findByName("ONAYLANDI")
                    .orElseThrow(() -> new RuntimeException("Onaylandı erişim sonucu bulunamadı"));
            accessResult = approvedResult;
            details = "Erişim onaylandı: " + (hasDirectPermission ? "Doğrudan yetki." : "Grup yetkisi.");
        } else {
            details += "Personelin kapıya erişim yetkisi yok.";

            // Yetkisiz erişim denemesi için bir alarm oluştur
            alertService.createUnauthorizedAccessAlert(scanningPersonnel, door);
        }

        // Erişim kaydı oluştur ve dön
        return accessLogService.createAccessLog(scanningPersonnel, null, door, qrAccessMethod, accessResult, details);
    }

}