package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.CardBlacklistReasonRequestDto;
import com.umut.passwise.dto.responses.CardBlacklistReasonResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.CardBlacklistReason;
import com.umut.passwise.repository.CardBlacklistReasonRepository;
import com.umut.passwise.service.abstracts.ICardBlacklistReasonService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CardBlacklistReasonServiceImpl implements ICardBlacklistReasonService {

    private final CardBlacklistReasonRepository cardBlacklistReasonRepository;

    @Autowired
    public CardBlacklistReasonServiceImpl(CardBlacklistReasonRepository cardBlacklistReasonRepository) {
        this.cardBlacklistReasonRepository = cardBlacklistReasonRepository;
    }

    @Override
    public List<CardBlacklistReasonResponseDto> findAll() {
        List<CardBlacklistReason> cardBlacklistReasonlist = cardBlacklistReasonRepository.findAll();
        List<CardBlacklistReasonResponseDto> dtoList = new ArrayList<>();

        for(CardBlacklistReason cardBlacklistReason: cardBlacklistReasonlist){
            CardBlacklistReasonResponseDto dto = new CardBlacklistReasonResponseDto();
            BeanUtils.copyProperties(cardBlacklistReason, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<CardBlacklistReasonResponseDto> findById(Long id) {
        Optional<CardBlacklistReason> cardBlacklistReason = cardBlacklistReasonRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (cardBlacklistReason.isPresent()) {
            CardBlacklistReasonResponseDto dto = new CardBlacklistReasonResponseDto();
            BeanUtils.copyProperties(cardBlacklistReason.get(), dto);  // cardBlacklistReason.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public CardBlacklistReasonResponseDto save(CardBlacklistReasonRequestDto cardBlacklistReasonRequestDto) {
        CardBlacklistReason cardBlacklistReason = new CardBlacklistReason();
        CardBlacklistReasonResponseDto cardBlacklistReasonResponseDto = new CardBlacklistReasonResponseDto();

        BeanUtils.copyProperties(cardBlacklistReasonRequestDto, cardBlacklistReason);

        cardBlacklistReasonRepository.save(cardBlacklistReason);

        BeanUtils.copyProperties(cardBlacklistReason, cardBlacklistReasonResponseDto);

        return cardBlacklistReasonResponseDto;
    }

    @Override
    public CardBlacklistReasonResponseDto update(Long id, CardBlacklistReasonRequestDto cardBlacklistReasonRequestDto) {
        // Mevcut entity'yi bul
        Optional<CardBlacklistReason> cardBlacklistReasonOptional = cardBlacklistReasonRepository.findById(id);

        if (cardBlacklistReasonOptional.isPresent()) {
            CardBlacklistReason cardBlacklistReason = cardBlacklistReasonOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(cardBlacklistReasonRequestDto, cardBlacklistReason);

            // Güncellenmiş entity'yi kaydet
            cardBlacklistReasonRepository.save(cardBlacklistReason);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            CardBlacklistReasonResponseDto cardBlacklistReasonResponseDto = new CardBlacklistReasonResponseDto();
            BeanUtils.copyProperties(cardBlacklistReason, cardBlacklistReasonResponseDto);

            return cardBlacklistReasonResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("CardBlacklistReason with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        cardBlacklistReasonRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return cardBlacklistReasonRepository.existsById(id);
    }
}
