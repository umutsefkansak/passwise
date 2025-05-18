package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.AdminRequestDto;
import com.umut.passwise.dto.responses.AdminResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.Admin;
import com.umut.passwise.repository.AdminRepository;
import com.umut.passwise.service.abstracts.IAdminService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AdminServiceImpl implements IAdminService {

    private final AdminRepository adminRepository;

    @Autowired
    public AdminServiceImpl(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public List<AdminResponseDto> findAll() {
        List<Admin> adminlist = adminRepository.findAll();
        List<AdminResponseDto> dtoList = new ArrayList<>();

        for(Admin admin: adminlist){
            AdminResponseDto dto = new AdminResponseDto();
            BeanUtils.copyProperties(admin, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<AdminResponseDto> findById(Long id) {
        Optional<Admin> admin = adminRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (admin.isPresent()) {
            AdminResponseDto dto = new AdminResponseDto();
            BeanUtils.copyProperties(admin.get(), dto);  // admin.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public AdminResponseDto save(AdminRequestDto adminRequestDto) {
        Admin admin = new Admin();
        AdminResponseDto adminResponseDto = new AdminResponseDto();

        BeanUtils.copyProperties(adminRequestDto, admin);

        adminRepository.save(admin);

        BeanUtils.copyProperties(admin, adminResponseDto);

        return adminResponseDto;
    }

    @Override
    public AdminResponseDto update(Long id, AdminRequestDto adminRequestDto) {
        // Mevcut entity'yi bul
        Optional<Admin> adminOptional = adminRepository.findById(id);

        if (adminOptional.isPresent()) {
            Admin admin = adminOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(adminRequestDto, admin);

            // Güncellenmiş entity'yi kaydet
            adminRepository.save(admin);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            AdminResponseDto adminResponseDto = new AdminResponseDto();
            BeanUtils.copyProperties(admin, adminResponseDto);

            return adminResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("Admin with ID " + id + " not found");
        }
    }

    @Override
    public Optional<AdminResponseDto> findByUsername(String username) {
        // Admin repository'de username ile sorgulama yapan bir metot gerekecek
        Optional<Admin> admin = adminRepository.findByUsername(username);
        if(admin.isPresent()){
            AdminResponseDto dto = new AdminResponseDto();
            BeanUtils.copyProperties(admin.get(), dto);  // admin.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }
        return Optional.empty();
    }

    @Override
    public void deleteById(Long id) {
        adminRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return adminRepository.existsById(id);
    }
}
