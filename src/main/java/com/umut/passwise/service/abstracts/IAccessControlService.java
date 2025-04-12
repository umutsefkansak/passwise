// IAccessControlService - Erişim kontrolü için servis arayüzü
package com.umut.passwise.service.abstracts;

import com.umut.passwise.dto.requests.CardAccessRequestDto;
import com.umut.passwise.dto.responses.AccessLogResponseDto;

public interface IAccessControlService {
    AccessLogResponseDto processCardAccess(CardAccessRequestDto requestDto);
}