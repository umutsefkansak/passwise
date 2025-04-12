package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.CardRequestDto;
import com.umut.passwise.dto.responses.CardResponseDto;
import com.umut.passwise.service.abstracts.ICardService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.Card;
import com.umut.passwise.repository.CardRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CardServiceImpl implements ICardService {

    private final CardRepository cardRepository;

    @Autowired
    public CardServiceImpl(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @Override
    public List<CardResponseDto> findAll() {
        List<Card> cardlist = cardRepository.findAll();
        List<CardResponseDto> dtoList = new ArrayList<>();

        for(Card card: cardlist){
            CardResponseDto dto = new CardResponseDto();
            BeanUtils.copyProperties(card, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<CardResponseDto> findById(Long id) {
        Optional<Card> card = cardRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (card.isPresent()) {
            CardResponseDto dto = new CardResponseDto();
            BeanUtils.copyProperties(card.get(), dto);  // card.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public CardResponseDto save(CardRequestDto cardRequestDto) {
        Card card = new Card();
        CardResponseDto cardResponseDto = new CardResponseDto();

        BeanUtils.copyProperties(cardRequestDto, card);

        cardRepository.save(card);

        BeanUtils.copyProperties(card, cardResponseDto);

        return cardResponseDto;
    }

    @Override
    public CardResponseDto update(Long id, CardRequestDto cardRequestDto) {
        // Mevcut entity'yi bul
        Optional<Card> cardOptional = cardRepository.findById(id);

        if (cardOptional.isPresent()) {
            Card card = cardOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(cardRequestDto, card);

            // Güncellenmiş entity'yi kaydet
            cardRepository.save(card);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            CardResponseDto cardResponseDto = new CardResponseDto();
            BeanUtils.copyProperties(card, cardResponseDto);

            return cardResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("Card with ID " + id + " not found");
        }
    }



    @Override
    public void deleteById(Long id) {
        cardRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return cardRepository.existsById(id);
    }
}
