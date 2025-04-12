// IAccessControlService - Erişim kontrolü için servis arayüzü
package com.umut.passwise.service.abstracts;

import com.umut.passwise.dto.requests.CardAccessRequestDto;
import com.umut.passwise.dto.requests.QrCodeAccessRequestDto;
import com.umut.passwise.dto.responses.AccessLogResponseDto;
import com.umut.passwise.entities.Personnel;

public interface IAccessControlService {
    AccessLogResponseDto processCardAccess(CardAccessRequestDto requestDto);
    AccessLogResponseDto processQrCodeAccess(QrCodeAccessRequestDto requestDto);
}