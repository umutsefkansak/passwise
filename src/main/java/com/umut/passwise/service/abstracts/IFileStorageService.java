package com.umut.passwise.service.abstracts;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

public interface IFileStorageService {
    // Sadece personel ID'sini alacak şekilde güncellendi
    String storePersonnelPhoto(MultipartFile file, Long personnelId) throws IOException;
    void deletePersonnelPhoto(String fileName) throws IOException;
    Path getPersonnelPhotoPath(String fileName);
}