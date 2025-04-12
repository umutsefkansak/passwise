package com.umut.passwise.controller;

import com.umut.passwise.dto.requests.CardAccessRequestDto;
import com.umut.passwise.dto.requests.QrCodeAccessRequestDto;
import com.umut.passwise.dto.responses.AccessLogResponseDto;
import com.umut.passwise.service.abstracts.IAccessControlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/access")
public class AccessControlController {

    private final IAccessControlService accessControlService;

    @Autowired
    public AccessControlController(IAccessControlService accessControlService) {
        this.accessControlService = accessControlService;
    }

    @PostMapping("/card")
    public ResponseEntity<AccessLogResponseDto> processCardAccess(@RequestBody CardAccessRequestDto requestDto) {
        AccessLogResponseDto responseDto = accessControlService.processCardAccess(requestDto);
        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/qr")
    public ResponseEntity<AccessLogResponseDto> processQrCodeAccess(@RequestBody QrCodeAccessRequestDto requestDto) {
        AccessLogResponseDto responseDto = accessControlService.processQrCodeAccess(requestDto);
        return ResponseEntity.ok(responseDto);
    }
}