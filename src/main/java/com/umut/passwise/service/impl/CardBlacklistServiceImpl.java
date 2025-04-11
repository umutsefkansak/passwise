package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.CardBlacklistRequestDto;
import com.umut.passwise.dto.responses.CardBlacklistResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.CardBlacklist;
import com.umut.passwise.repository.CardBlacklistRepository;
import com.umut.passwise.service.abstracts.ICardBlacklistService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CardBlacklistServiceImpl implements ICardBlacklistService {

    private final CardBlacklistRepository cardBlacklistRepository;

    @Autowired
    public CardBlacklistServiceImpl(CardBlacklistRepository cardBlacklistRepository) {
        this.cardBlacklistRepository = cardBlacklistRepository;
    }

    @Override
    public List<CardBlacklistResponseDto> findAll() {
        List<CardBlacklist> cardBlacklistlist = cardBlacklistRepository.findAll();
        List<CardBlacklistResponseDto> dtoList = new ArrayList<>();

        for(CardBlacklist cardBlacklist: cardBlacklistlist){
            CardBlacklistResponseDto dto = new CardBlacklistResponseDto();
            BeanUtils.copyProperties(cardBlacklist, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<CardBlacklistResponseDto> findById(Long id) {
        Optional<CardBlacklist> cardBlacklist = cardBlacklistRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (cardBlacklist.isPresent()) {
            CardBlacklistResponseDto dto = new CardBlacklistResponseDto();
            BeanUtils.copyProperties(cardBlacklist.get(), dto);  // cardBlacklist.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public CardBlacklistResponseDto save(CardBlacklistRequestDto cardBlacklistRequestDto) {
        CardBlacklist cardBlacklist = new CardBlacklist();
        CardBlacklistResponseDto cardBlacklistResponseDto = new CardBlacklistResponseDto();

        BeanUtils.copyProperties(cardBlacklistRequestDto, cardBlacklist);

        cardBlacklistRepository.save(cardBlacklist);

        BeanUtils.copyProperties(cardBlacklist, cardBlacklistResponseDto);

        return cardBlacklistResponseDto;
    }

    @Override
    public CardBlacklistResponseDto update(Long id, CardBlacklistRequestDto cardBlacklistRequestDto) {
        // Mevcut entity'yi bul
        Optional<CardBlacklist> cardBlacklistOptional = cardBlacklistRepository.findById(id);

        if (cardBlacklistOptional.isPresent()) {
            CardBlacklist cardBlacklist = cardBlacklistOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(cardBlacklistRequestDto, cardBlacklist);

            // Güncellenmiş entity'yi kaydet
            cardBlacklistRepository.save(cardBlacklist);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            CardBlacklistResponseDto cardBlacklistResponseDto = new CardBlacklistResponseDto();
            BeanUtils.copyProperties(cardBlacklist, cardBlacklistResponseDto);

            return cardBlacklistResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("CardBlacklist with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        cardBlacklistRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return cardBlacklistRepository.existsById(id);
    }
}
