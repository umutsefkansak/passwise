package com.umut.passwise.service.abstracts;
import java.util.List;
import java.util.Optional;

import com.umut.passwise.dto.requests.AuthLogRequestDto;
import com.umut.passwise.dto.responses.AuthLogResponseDto;
import com.umut.passwise.entities.Admin;
import com.umut.passwise.entities.Door;
import com.umut.passwise.entities.PermissionGroup;
import com.umut.passwise.entities.Personnel;

public interface IAuthLogService {

    List<AuthLogResponseDto> findAll();

    Optional<AuthLogResponseDto> findById(Long id);

    AuthLogResponseDto save(AuthLogRequestDto authLogRequestDto);

    AuthLogResponseDto update(Long id, AuthLogRequestDto authLogRequestDto);

    void deleteById(Long id);

    boolean existsById(Long id);

    // Yeni metodlar:
    void logDoorPermissionGrant(Admin admin, Personnel personnel, Door door);
    void logPermissionGroupGrant(Admin admin, Personnel personnel, PermissionGroup permissionGroup);
    void logBulkDoorPermissionGrant(Admin admin, Personnel personnel, List<Door> doors);
    void logBulkPermissionGroupGrant(Admin admin, Personnel personnel, List<PermissionGroup> permissionGroups);
    List<AuthLogResponseDto> findRecentLogs(int limit);


    void logDoorPermissionRevoke(Admin admin, Personnel personnel, Door door);
    void logPermissionGroupRevoke(Admin admin, Personnel personnel, PermissionGroup permissionGroup);
    void logBulkDoorPermissionRevoke(Admin admin, Personnel personnel, List<Door> doors);
    void logBulkPermissionGroupRevoke(Admin admin, Personnel personnel, List<PermissionGroup> permissionGroups);
}
