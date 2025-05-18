@PutMapping("/{id}")
public ResponseEntity<AdminResponseDto> updateEntity(@PathVariable("id") Long id, @RequestBody AdminRequestDto adminRequestDto) {
    try {
        // ID'yi kontrol et
        if (!adminService.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Mevcut admin'i al
        Optional<AdminResponseDto> existingAdmin = adminService.findById(id);
        if (existingAdmin.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Güncellenmiş entity'yi döndür
        AdminResponseDto updatedEntity = adminService.update(id, adminRequestDto);
        return new ResponseEntity<>(updatedEntity, HttpStatus.OK);
    } catch (Exception e) {
        System.out.println("Admin güncelleme hatası: " + e.getMessage());
        e.printStackTrace();
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

@Override
public AdminResponseDto update(Long id, AdminRequestDto adminRequestDto) {
    // Mevcut admin'i bul
    Admin existingAdmin = adminRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Admin bulunamadı: " + id));
    
    // Şifre alanı boş ise mevcut şifreyi koru
    if (adminRequestDto.getPassword() == null || adminRequestDto.getPassword().isEmpty()) {
        // Sadece ad, soyad ve kullanıcı adını güncelle
        existingAdmin.setName(adminRequestDto.getName());
        existingAdmin.setSurname(adminRequestDto.getSurname());
        existingAdmin.setUsername(adminRequestDto.getUsername());
    } else {
        // Tüm alanları güncelle (şifre dahil)
        existingAdmin.setName(adminRequestDto.getName());
        existingAdmin.setSurname(adminRequestDto.getSurname());
        existingAdmin.setUsername(adminRequestDto.getUsername());
        existingAdmin.setPassword(passwordEncoder.encode(adminRequestDto.getPassword()));
    }
    
    // Güncellenmiş admin'i kaydet
    Admin updatedAdmin = adminRepository.save(existingAdmin);
    
    // DTO'ya dönüştür ve döndür
    return adminMapper.toDto(updatedAdmin);
} 