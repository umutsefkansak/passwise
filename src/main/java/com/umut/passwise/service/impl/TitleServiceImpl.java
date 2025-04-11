package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.TitleRequestDto;
import com.umut.passwise.dto.responses.TitleResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.Title;
import com.umut.passwise.repository.TitleRepository;
import com.umut.passwise.service.abstracts.ITitleService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TitleServiceImpl implements ITitleService {

    private final TitleRepository titleRepository;

    @Autowired
    public TitleServiceImpl(TitleRepository titleRepository) {
        this.titleRepository = titleRepository;
    }

    @Override
    public List<TitleResponseDto> findAll() {
        List<Title> titlelist = titleRepository.findAll();
        List<TitleResponseDto> dtoList = new ArrayList<>();

        for(Title title: titlelist){
            TitleResponseDto dto = new TitleResponseDto();
            BeanUtils.copyProperties(title, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<TitleResponseDto> findById(Long id) {
        Optional<Title> title = titleRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (title.isPresent()) {
            TitleResponseDto dto = new TitleResponseDto();
            BeanUtils.copyProperties(title.get(), dto);  // title.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public TitleResponseDto save(TitleRequestDto titleRequestDto) {
        Title title = new Title();
        TitleResponseDto titleResponseDto = new TitleResponseDto();

        BeanUtils.copyProperties(titleRequestDto, title);

        titleRepository.save(title);

        BeanUtils.copyProperties(title, titleResponseDto);

        return titleResponseDto;
    }

    @Override
    public TitleResponseDto update(Long id, TitleRequestDto titleRequestDto) {
        // Mevcut entity'yi bul
        Optional<Title> titleOptional = titleRepository.findById(id);

        if (titleOptional.isPresent()) {
            Title title = titleOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(titleRequestDto, title);

            // Güncellenmiş entity'yi kaydet
            titleRepository.save(title);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            TitleResponseDto titleResponseDto = new TitleResponseDto();
            BeanUtils.copyProperties(title, titleResponseDto);

            return titleResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("Title with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        titleRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return titleRepository.existsById(id);
    }
}
