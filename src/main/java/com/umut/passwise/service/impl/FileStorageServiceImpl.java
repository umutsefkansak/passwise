package com.umut.passwise.service.impl;

import com.umut.passwise.service.abstracts.IFileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements IFileStorageService {

    @Value("${file.upload-dir:uploads/photos}")
    private String uploadDir;

    @Override
    public String storePersonnelPhoto(MultipartFile file, Long personnelId) throws IOException {
        // Dosya ismini UUID ve personel ID ile oluştur
        String fileExtension = getFileExtension(file.getOriginalFilename());
        String fileName = "personnel_" + personnelId + "_" + UUID.randomUUID().toString() + fileExtension;

        // Yükleme dizinini oluştur
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Dosyayı kaydet
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    @Override
    public void deletePersonnelPhoto(String fileName) throws IOException {
        if (fileName != null && !fileName.isEmpty()) {
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            Files.deleteIfExists(filePath);
        }
    }

    @Override
    public Path getPersonnelPhotoPath(String fileName) {
        return Paths.get(uploadDir).resolve(fileName).normalize();
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) {
            return "";
        }
        int dotIndex = fileName.lastIndexOf('.');
        return (dotIndex == -1) ? "" : fileName.substring(dotIndex);
    }
}