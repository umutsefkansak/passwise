package com.umut.passwise.service.impl;

import com.umut.passwise.dto.requests.CardAccessRequestDto;
import com.umut.passwise.dto.responses.AccessLogResponseDto;
import com.umut.passwise.entities.*;
import com.umut.passwise.repository.*;
import com.umut.passwise.service.abstracts.IAccessControlService;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;

@Service
public class AccessControlServiceImpl implements IAccessControlService {

    private final CardRepository cardRepository;
    private final CardBlacklistRepository cardBlacklistRepository;
    private final PersonnelRepository personnelRepository;
    private final PersonnelBlacklistRepository personnelBlacklistRepository;
    private final PersonnelPermissionRepository personnelPermissionRepository;
    private final PermissionRepository permissionRepository;
    private final PersonnelPermissionGroupRepository personnelPermissionGroupRepository;
    private final AccessLogRepository accessLogRepository;
    private final AccessMethodRepository accessMethodRepository;
    private final AccessResultRepository accessResultRepository;
    private final DoorRepository doorRepository;
    private final AlertRepository alertRepository;
    private final AlertTypeRepository alertTypeRepository;

    @Autowired
    public AccessControlServiceImpl(
            CardRepository cardRepository,
            CardBlacklistRepository cardBlacklistRepository,
            PersonnelRepository personnelRepository,
            PersonnelBlacklistRepository personnelBlacklistRepository,
            PersonnelPermissionRepository personnelPermissionRepository,
            PermissionRepository permissionRepository,
            PersonnelPermissionGroupRepository personnelPermissionGroupRepository,
            AccessLogRepository accessLogRepository,
            AccessMethodRepository accessMethodRepository,
            AccessResultRepository accessResultRepository,
            DoorRepository doorRepository,
            AlertRepository alertRepository,
            AlertTypeRepository alertTypeRepository) {
        this.cardRepository = cardRepository;
        this.cardBlacklistRepository = cardBlacklistRepository;
        this.personnelRepository = personnelRepository;
        this.personnelBlacklistRepository = personnelBlacklistRepository;
        this.personnelPermissionRepository = personnelPermissionRepository;
        this.permissionRepository = permissionRepository;
        this.personnelPermissionGroupRepository = personnelPermissionGroupRepository;
        this.accessLogRepository = accessLogRepository;
        this.accessMethodRepository = accessMethodRepository;
        this.accessResultRepository = accessResultRepository;
        this.doorRepository = doorRepository;
        this.alertRepository = alertRepository;
        this.alertTypeRepository = alertTypeRepository;
    }

    @Transactional
    public AccessLogResponseDto processCardAccess(CardAccessRequestDto requestDto) {
        String cardNumber = requestDto.getCardNumber();
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
            return createAccessLog(null, null, door, cardAccessMethod, deniedResult, details);
        }

        Card card = cardOptional.get();

        // Kartın aktif olup olmadığını kontrol et
        if (!card.getActive()) {
            details += "Kart aktif değil.";
            return createAccessLog(null, card, door, cardAccessMethod, deniedResult, details);
        }

        // Kartın kara listede olup olmadığını kontrol et
        if (cardBlacklistRepository.existsByCard(card)) {
            details += "Kart kara listede.";
            return createAccessLog(null, card, door, cardAccessMethod, deniedResult, details);
        }

        // Personeli bul
        Personnel personnel = card.getPersonel();
        if (personnel == null) {
            details += "Kart herhangi bir personele atanmamış.";
            return createAccessLog(null, card, door, cardAccessMethod, deniedResult, details);
        }

        // Personelin aktif olup olmadığını kontrol et
        if (!personnel.isActive()) {
            details += "Personel aktif değil.";
            return createAccessLog(personnel, card, door, cardAccessMethod, deniedResult, details);
        }

        // Personelin kara listede olup olmadığını kontrol et
        if (personnelBlacklistRepository.existsByPersonnel(personnel)) {
            details += "Personel kara listede.";
            return createAccessLog(personnel, card, door, cardAccessMethod, deniedResult, details);
        }

        // Direkt kapı yetkisini kontrol et
        boolean hasDirectPermission = personnelPermissionRepository.existsByPersonnelAndDoor(personnel, door);

        // Dolaylı kapı yetkisini kontrol et (yetki grupları üzerinden)
        boolean hasIndirectPermission = false;
        if (!hasDirectPermission) {
            // Personelin üye olduğu yetki gruplarını bul
            Set<PersonnelPermissionGroup> permissionGroups = personnel.getPermissionGroupMemberships();
            if (permissionGroups != null && !permissionGroups.isEmpty()) {
                for (PersonnelPermissionGroup permissionGroup : permissionGroups) {
                    // Her bir yetki grubunun içindeki kapı yetkilerini kontrol et
                    PermissionGroup group = permissionGroup.getPermissionGroup();
                    Set<Permission> permissions = group.getPermissions();

                    if (permissions != null) {
                        for (Permission permission : permissions) {
                            if (permission.getDoor().getId().equals(doorId)) {
                                hasIndirectPermission = true;
                                break;
                            }
                        }
                    }

                    if (hasIndirectPermission) {
                        break;
                    }
                }
            }
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
            createUnauthorizedAccessAlert(personnel, door);
        }

        // Erişim kaydı oluştur ve dön
        return createAccessLog(personnel, card, door, cardAccessMethod, accessResult, details);
    }

    private AccessLogResponseDto createAccessLog(Personnel personnel, Card card, Door door,
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

    private void createUnauthorizedAccessAlert(Personnel personnel, Door door) {
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