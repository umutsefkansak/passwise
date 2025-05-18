package com.umut.passwise.service.impl;

import com.umut.passwise.dto.requests.AuthLogRequestDto;
import com.umut.passwise.dto.responses.AuthLogResponseDto;
import com.umut.passwise.entities.*;
import com.umut.passwise.repository.*;
import com.umut.passwise.service.abstracts.IAuthLogService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthLogServiceImpl implements IAuthLogService {

    private final AuthLogRepository authLogRepository;
    private final ActionTypeRepository actionTypeRepository;

    private final AdminRepository adminRepository;
    private final PersonnelRepository personnelRepository;
    private final DoorRepository doorRepository;

    private final PermissionGroupRepository permissionGroupRepository;

    @Autowired
    public AuthLogServiceImpl(AuthLogRepository authLogRepository, ActionTypeRepository actionTypeRepository, AdminRepository adminRepository, PersonnelRepository personnelRepository, DoorRepository doorRepository, PermissionGroupRepository permissionGroupRepository) {
        this.authLogRepository = authLogRepository;
        this.actionTypeRepository = actionTypeRepository;
        this.adminRepository = adminRepository;
        this.personnelRepository = personnelRepository;
        this.doorRepository = doorRepository;
        this.permissionGroupRepository = permissionGroupRepository;
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

    @Override
    public void logDoorPermissionGrant(Admin admin, Personnel personnel, Door door) {
        AuthLog log = new AuthLog();

        Optional<Admin> adminOptional = adminRepository.findById(admin.getId());
        Optional<Personnel> personnelOptional = personnelRepository.findById(personnel.getId());
        Optional<Door> doorOptional = doorRepository.findById(door.getId());

        if (adminOptional.isPresent()) {
             admin = adminOptional.get();
        }

        if (personnelOptional.isPresent()) {
            personnel = personnelOptional.get();
        }

        if (doorOptional.isPresent()) {
            door = doorOptional.get();
        }


        log.setAdmin(admin);
        log.setPersonnel(personnel);
        log.setDoor(door);
        log.setIsGroupPermission(false);

        // ActionType GRANT bul (eğer yoksa oluştur)
        ActionType grantActionType = getGrantActionType();
        log.setActionType(grantActionType);

        // Açıklama oluştur
        String description = personnel.getName().toUpperCase() + " " + personnel.getSurname().toUpperCase() +
                " personeline " + door.getName() + " kapısı yetkisi "+admin.getUsername().toUpperCase()+" tarafından verildi";
        log.setDescription(description);

        authLogRepository.save(log);
    }

    @Override
    public void logPermissionGroupGrant(Admin admin, Personnel personnel, PermissionGroup permissionGroup) {
        AuthLog log = new AuthLog();

        Optional<Admin> adminOptional = adminRepository.findById(admin.getId());
        Optional<Personnel> personnelOptional = personnelRepository.findById(personnel.getId());
        Optional<PermissionGroup> permissionGroupOptional = permissionGroupRepository.findById(permissionGroup.getId());

        if (adminOptional.isPresent()) {
            admin = adminOptional.get();
        }

        if (personnelOptional.isPresent()) {
            personnel = personnelOptional.get();
        }

        if (permissionGroupOptional.isPresent()) {
            permissionGroup = permissionGroupOptional.get();
        }



        log.setAdmin(admin);
        log.setPersonnel(personnel);
        log.setPermissionGroup(permissionGroup);
        log.setIsGroupPermission(true);

        // ActionType GRANT bul
        ActionType grantActionType = getGrantActionType();
        log.setActionType(grantActionType);

        // Açıklama oluştur
        String description = personnel.getName().toUpperCase() + " " + personnel.getSurname().toUpperCase() +
                " personeline " + permissionGroup.getName() + " yetki grubu "+admin.getUsername().toUpperCase()+" tarafından verildi";
        log.setDescription(description);

        authLogRepository.save(log);
    }

    @Override
    public void logBulkDoorPermissionGrant(Admin admin, Personnel personnel, List<Door> doors) {
        AuthLog log = new AuthLog();
        log.setAdmin(admin);
        log.setPersonnel(personnel);
        log.setIsGroupPermission(false);

        // ActionType GRANT bul
        ActionType grantActionType = getGrantActionType();
        log.setActionType(grantActionType);

        // Açıklama oluştur
        String doorNames = doors.stream()
                .map(Door::getName)
                .collect(Collectors.joining(", "));

        String description = personnel.getName() + " " + personnel.getSurname() +
                " personeline şu kapılar için "+admin.getUsername().toUpperCase()+" tarafından yetki verildi: " + doorNames;
        log.setDescription(description);

        //authLogRepository.save(log);
        for (Door door : doors) {
            logDoorPermissionGrant(admin, personnel, door);
        }
    }

    @Override
    public void logBulkPermissionGroupGrant(Admin admin, Personnel personnel, List<PermissionGroup> permissionGroups) {
        AuthLog log = new AuthLog();
        log.setAdmin(admin);
        log.setPersonnel(personnel);
        log.setIsGroupPermission(true);

        // ActionType GRANT bul
        ActionType grantActionType = getGrantActionType();
        log.setActionType(grantActionType);

        // Açıklama oluştur
        String groupNames = permissionGroups.stream()
                .map(PermissionGroup::getName)
                .collect(Collectors.joining(", "));

        String description = personnel.getName() + " " + personnel.getSurname() +
                " personeline şu yetki grupları için "+admin.getUsername().toUpperCase()+" tarafından verildi: " + groupNames;
        log.setDescription(description);

        //authLogRepository.save(log);
        for (PermissionGroup permissionGroup : permissionGroups) {
            logPermissionGroupGrant(admin, personnel, permissionGroup);
        }
    }

    @Override
    public List<AuthLogResponseDto> findRecentLogs(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("authDate").descending());
        List<AuthLog> logs = authLogRepository.findAll(pageable).getContent();

        List<AuthLogResponseDto> dtoList = new ArrayList<>();
        for (AuthLog log : logs) {
            AuthLogResponseDto dto = new AuthLogResponseDto();
            BeanUtils.copyProperties(log, dto);
            dtoList.add(dto);
        }

        return dtoList;
    }

    // GRANT ActionType'ı getir veya oluştur
    private ActionType getGrantActionType() {
        Optional<ActionType> actionTypeOpt = actionTypeRepository.findByName("GRANT");
        if (actionTypeOpt.isPresent()) {
            return actionTypeOpt.get();
        } else {
            ActionType grantActionType = new ActionType();
            grantActionType.setName("GRANT");
            grantActionType.setDescription("Yetki verme işlemi");
            return actionTypeRepository.save(grantActionType);
        }
    }

    // REVOKE ActionType'ı getir veya oluştur
    private ActionType getRevokeActionType() {
        Optional<ActionType> actionTypeOpt = actionTypeRepository.findByName("REVOKE");
        if (actionTypeOpt.isPresent()) {
            return actionTypeOpt.get();
        } else {
            ActionType revokeActionType = new ActionType();
            revokeActionType.setName("REVOKE");
            revokeActionType.setDescription("Yetki kaldırma işlemi");
            return actionTypeRepository.save(revokeActionType);
        }
    }

    @Override
    public void logDoorPermissionRevoke(Admin admin, Personnel personnel, Door door) {
        AuthLog log = new AuthLog();

        Optional<Admin> adminOptional = adminRepository.findById(admin.getId());
        Optional<Personnel> personnelOptional = personnelRepository.findById(personnel.getId());
        Optional<Door> doorOptional = doorRepository.findById(door.getId());

        if (adminOptional.isPresent()) {
            admin = adminOptional.get();
        }

        if (personnelOptional.isPresent()) {
            personnel = personnelOptional.get();
        }

        if (doorOptional.isPresent()) {
            door = doorOptional.get();
        }

        log.setAdmin(admin);
        log.setPersonnel(personnel);
        log.setDoor(door);
        log.setIsGroupPermission(false);

        // ActionType REVOKE bul
        ActionType revokeActionType = getRevokeActionType();
        log.setActionType(revokeActionType);

        // Açıklama oluştur
        String description = personnel.getName().toUpperCase() + " " + personnel.getSurname().toUpperCase() +
                " personelinin " + door.getName() + " kapısı yetkisi " + admin.getUsername().toUpperCase() + " tarafından kaldırıldı";
        log.setDescription(description);

        authLogRepository.save(log);
    }

    @Override
    public void logPermissionGroupRevoke(Admin admin, Personnel personnel, PermissionGroup permissionGroup) {
        AuthLog log = new AuthLog();

        Optional<Admin> adminOptional = adminRepository.findById(admin.getId());
        Optional<Personnel> personnelOptional = personnelRepository.findById(personnel.getId());
        Optional<PermissionGroup> permissionGroupOptional = permissionGroupRepository.findById(permissionGroup.getId());

        if (adminOptional.isPresent()) {
            admin = adminOptional.get();
        }

        if (personnelOptional.isPresent()) {
            personnel = personnelOptional.get();
        }

        if (permissionGroupOptional.isPresent()) {
            permissionGroup = permissionGroupOptional.get();
        }

        log.setAdmin(admin);
        log.setPersonnel(personnel);
        log.setPermissionGroup(permissionGroup);
        log.setIsGroupPermission(true);

        // ActionType REVOKE bul
        ActionType revokeActionType = getRevokeActionType();
        log.setActionType(revokeActionType);

        // Açıklama oluştur
        String description = personnel.getName().toUpperCase() + " " + personnel.getSurname().toUpperCase() +
                " personelinin " + permissionGroup.getName() + " yetki grubu " + admin.getUsername().toUpperCase() + " tarafından kaldırıldı";
        log.setDescription(description);

        authLogRepository.save(log);
    }

    @Override
    public void logBulkDoorPermissionRevoke(Admin admin, Personnel personnel, List<Door> doors) {
        AuthLog log = new AuthLog();
        log.setAdmin(admin);
        log.setPersonnel(personnel);
        log.setIsGroupPermission(false);

        // ActionType REVOKE bul
        ActionType revokeActionType = getRevokeActionType();
        log.setActionType(revokeActionType);

        // Açıklama oluştur
        String doorNames = doors.stream()
                .map(Door::getName)
                .collect(Collectors.joining(", "));

        String description = personnel.getName().toUpperCase() + " " + personnel.getSurname().toUpperCase() +
                " personelinin şu kapılar için " + admin.getUsername().toUpperCase() + " tarafından yetkisi kaldırıldı: " + doorNames;
        log.setDescription(description);

        //authLogRepository.save(log);
        for (Door door : doors) {
            logDoorPermissionRevoke(admin, personnel, door);
        }
    }

    @Override
    public void logBulkPermissionGroupRevoke(Admin admin, Personnel personnel, List<PermissionGroup> permissionGroups) {
        AuthLog log = new AuthLog();
        log.setAdmin(admin);
        log.setPersonnel(personnel);
        log.setIsGroupPermission(true);

        // ActionType REVOKE bul
        ActionType revokeActionType = getRevokeActionType();
        log.setActionType(revokeActionType);

        // Açıklama oluştur
        String groupNames = permissionGroups.stream()
                .map(PermissionGroup::getName)
                .collect(Collectors.joining(", "));

        String description = personnel.getName().toUpperCase() + " " + personnel.getSurname().toUpperCase() +
                " personelinin şu yetki grupları " + admin.getUsername().toUpperCase() + " tarafından kaldırıldı: " + groupNames;
        log.setDescription(description);

        //authLogRepository.save(log);
        for (PermissionGroup permissionGroup : permissionGroups) {
            logPermissionGroupRevoke(admin, personnel, permissionGroup);
        }
    }

}

/*

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
*/