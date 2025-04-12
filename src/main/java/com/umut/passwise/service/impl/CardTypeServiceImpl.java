package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.CardTypeRequestDto;
import com.umut.passwise.dto.responses.CardTypeResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.CardType;
import com.umut.passwise.repository.CardTypeRepository;
import com.umut.passwise.service.abstracts.ICardTypeService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CardTypeServiceImpl implements ICardTypeService {

    private final CardTypeRepository cardTypeRepository;

    @Autowired
    public CardTypeServiceImpl(CardTypeRepository cardTypeRepository) {
        this.cardTypeRepository = cardTypeRepository;
    }

    @Override
    public List<CardTypeResponseDto> findAll() {
        List<CardType> cardTypelist = cardTypeRepository.findAll();
        List<CardTypeResponseDto> dtoList = new ArrayList<>();

        for(CardType cardType: cardTypelist){
            CardTypeResponseDto dto = new CardTypeResponseDto();
            BeanUtils.copyProperties(cardType, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<CardTypeResponseDto> findById(Long id) {
        Optional<CardType> cardType = cardTypeRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (cardType.isPresent()) {
            CardTypeResponseDto dto = new CardTypeResponseDto();
            BeanUtils.copyProperties(cardType.get(), dto);  // cardType.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public CardTypeResponseDto save(CardTypeRequestDto cardTypeRequestDto) {
        CardType cardType = new CardType();
        CardTypeResponseDto cardTypeResponseDto = new CardTypeResponseDto();

        BeanUtils.copyProperties(cardTypeRequestDto, cardType);

        cardTypeRepository.save(cardType);

        BeanUtils.copyProperties(cardType, cardTypeResponseDto);

        return cardTypeResponseDto;
    }

    @Override
    public CardTypeResponseDto update(Long id, CardTypeRequestDto cardTypeRequestDto) {
        // Mevcut entity'yi bul
        Optional<CardType> cardTypeOptional = cardTypeRepository.findById(id);

        if (cardTypeOptional.isPresent()) {
            CardType cardType = cardTypeOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(cardTypeRequestDto, cardType);

            // Güncellenmiş entity'yi kaydet
            cardTypeRepository.save(cardType);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            CardTypeResponseDto cardTypeResponseDto = new CardTypeResponseDto();
            BeanUtils.copyProperties(cardType, cardTypeResponseDto);

            return cardTypeResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("CardType with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        cardTypeRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return cardTypeRepository.existsById(id);
    }
}
