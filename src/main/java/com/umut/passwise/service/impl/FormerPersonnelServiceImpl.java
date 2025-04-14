package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.FormerPersonnelRequestDto;
import com.umut.passwise.dto.responses.FormerPersonnelResponseDto;
import com.umut.passwise.entities.Personnel;
import com.umut.passwise.entities.PersonnelBlacklist;
import com.umut.passwise.repository.PersonnelRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.FormerPersonnel;
import com.umut.passwise.repository.FormerPersonnelRepository;
import com.umut.passwise.service.abstracts.IFormerPersonnelService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FormerPersonnelServiceImpl implements IFormerPersonnelService {

    private final FormerPersonnelRepository formerPersonnelRepository;
    private final PersonnelRepository personnelRepository;

    @Autowired
    public FormerPersonnelServiceImpl(FormerPersonnelRepository formerPersonnelRepository, PersonnelRepository personnelRepository) {
        this.formerPersonnelRepository = formerPersonnelRepository;
        this.personnelRepository = personnelRepository;
    }

    @Override
    public List<FormerPersonnelResponseDto> findAll() {
        List<FormerPersonnel> formerPersonnellist = formerPersonnelRepository.findAll();
        List<FormerPersonnelResponseDto> dtoList = new ArrayList<>();

        for(FormerPersonnel formerPersonnel: formerPersonnellist){
            FormerPersonnelResponseDto dto = new FormerPersonnelResponseDto();
            BeanUtils.copyProperties(formerPersonnel, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<FormerPersonnelResponseDto> findById(Long id) {
        Optional<FormerPersonnel> formerPersonnel = formerPersonnelRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (formerPersonnel.isPresent()) {
            FormerPersonnelResponseDto dto = new FormerPersonnelResponseDto();
            BeanUtils.copyProperties(formerPersonnel.get(), dto);  // formerPersonnel.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    /*@Override
    public FormerPersonnelResponseDto save(FormerPersonnelRequestDto formerPersonnelRequestDto) {
        FormerPersonnel formerPersonnel = new FormerPersonnel();
        FormerPersonnelResponseDto formerPersonnelResponseDto = new FormerPersonnelResponseDto();

        BeanUtils.copyProperties(formerPersonnelRequestDto, formerPersonnel);

        formerPersonnelRepository.save(formerPersonnel);

        BeanUtils.copyProperties(formerPersonnel, formerPersonnelResponseDto);

        setPersonnelActiveState(formerPersonnelRequestDto.getPersonnel().getId(),false);

        return formerPersonnelResponseDto;
    }*/

    @Override
    public FormerPersonnelResponseDto save(FormerPersonnelRequestDto formerPersonnelRequestDto) {
        // Önce personelin daha önce ayrılanlar listesinde olup olmadığını kontrol et
        Long personnelId = formerPersonnelRequestDto.getPersonnel().getId();

        // Personelin zaten ayrılanlar listesinde olup olmadığını kontrol et
        Optional<FormerPersonnel> existingFormerPersonnel = formerPersonnelRepository
                .findByPersonnelId(personnelId);

        if (existingFormerPersonnel.isPresent()) {
            // Eğer personel zaten ayrılanlar listesindeyse hata gönder
            throw new IllegalStateException("Personnel zaten ayrılan listesinde bulunmaktadır.");
        }

        // Personel ayrılanlar listesinde değilse, kaydetme işlemine devam et
        FormerPersonnel formerPersonnel = new FormerPersonnel();
        FormerPersonnelResponseDto formerPersonnelResponseDto = new FormerPersonnelResponseDto();

        BeanUtils.copyProperties(formerPersonnelRequestDto, formerPersonnel);

        formerPersonnelRepository.save(formerPersonnel);

        BeanUtils.copyProperties(formerPersonnel, formerPersonnelResponseDto);

        //Personelin çalışma durumunu pasif yap
        setPersonnelActiveState(personnelId, false);

        return formerPersonnelResponseDto;
    }
    @Override
    public FormerPersonnelResponseDto update(Long id, FormerPersonnelRequestDto formerPersonnelRequestDto) {
        // Mevcut entity'yi bul
        Optional<FormerPersonnel> formerPersonnelOptional = formerPersonnelRepository.findById(id);

        if (formerPersonnelOptional.isPresent()) {
            FormerPersonnel formerPersonnel = formerPersonnelOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(formerPersonnelRequestDto, formerPersonnel);

            // Güncellenmiş entity'yi kaydet
            formerPersonnelRepository.save(formerPersonnel);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            FormerPersonnelResponseDto formerPersonnelResponseDto = new FormerPersonnelResponseDto();
            BeanUtils.copyProperties(formerPersonnel, formerPersonnelResponseDto);

            return formerPersonnelResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("FormerPersonnel with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {

        //AYRILAN LİSTESİNDEN KALDIRILAN PERSONELİN ÇALIŞMA DURUMUNU TRUE YAP
        Optional<FormerPersonnel> formerPersonnelOptional = formerPersonnelRepository.findById(id);
        if(formerPersonnelOptional.isPresent()){
            FormerPersonnel formerPersonnel = formerPersonnelOptional.get();
            setPersonnelActiveState(formerPersonnel.getPersonnel().getId(),true);
        }


        formerPersonnelRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return formerPersonnelRepository.existsById(id);
    }


    @Override
    public void setPersonnelActiveState(Long personnelId, boolean isActive) {
        //PERSONELİN ÇALIŞMA DURUMUNU DEGİSTİR
        Optional<Personnel> personnelOptional = personnelRepository.findById(personnelId);
        if (personnelOptional.isPresent()){
            Personnel personnel = personnelOptional.get();
            personnel.setActive(isActive);
            personnelRepository.save(personnel);
        }

    }
}
