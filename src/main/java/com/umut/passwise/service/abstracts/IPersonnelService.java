package com.umut.passwise.service.abstracts;

import com.umut.passwise.dto.requests.PersonnelRequestDto;
import com.umut.passwise.dto.responses.PersonnelResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface IPersonnelService {
    List<PersonnelResponseDto> findAll();

    List<PersonnelResponseDto> findAllByIsActiveTrue();

    List<PersonnelResponseDto> findAllByIsActiveFalse();

    Optional<PersonnelResponseDto> findById(Long id);
    PersonnelResponseDto save(PersonnelRequestDto personnelRequestDto);
    PersonnelResponseDto update(Long id, PersonnelRequestDto personnelRequestDto);
    void deleteById(Long id);
    boolean existsById(Long id);

    // Fotoğraf yükleme metodu eklendi
    String uploadPhoto(Long id, MultipartFile file) throws IOException;

    // Fotoğraf silme metodu eklendi
    void deletePhoto(Long id) throws IOException;
}