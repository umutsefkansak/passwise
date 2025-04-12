package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.CardBlacklistRequestDto;
import com.umut.passwise.dto.requests.CardRequestDto;
import com.umut.passwise.dto.responses.CardBlacklistResponseDto;
import com.umut.passwise.entities.Card;
import com.umut.passwise.entities.Personnel;
import com.umut.passwise.repository.CardRepository;
import com.umut.passwise.repository.PersonnelRepository;
import com.umut.passwise.service.abstracts.ICardService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.CardBlacklist;
import com.umut.passwise.repository.CardBlacklistRepository;
import com.umut.passwise.service.abstracts.ICardBlacklistService;
import java.sql.Timestamp;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CardBlacklistServiceImpl implements ICardBlacklistService {

    private final CardBlacklistRepository cardBlacklistRepository;
    private final CardRepository cardRepository;

    private final PersonnelRepository personnelRepository;

    private final ICardService cardService;

    @Autowired
    public CardBlacklistServiceImpl(CardBlacklistRepository cardBlacklistRepository, CardRepository cardRepository, PersonnelRepository personnelRepository, ICardService cardService) {
        this.cardBlacklistRepository = cardBlacklistRepository;

        this.cardRepository = cardRepository;
        this.personnelRepository = personnelRepository;
        this.cardService = cardService;
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

        // Önce kartın zaten kara listede olup olmadığını kontrol et
        boolean exists = cardBlacklistRepository.existsByCardId(cardBlacklistRequestDto.getCard().getId());

        if (exists) {
            throw new IllegalStateException("Bu kart zaten kara listeye eklenmiş.");
        }

        CardBlacklist cardBlacklist = new CardBlacklist();
        CardBlacklistResponseDto cardBlacklistResponseDto = new CardBlacklistResponseDto();
        BeanUtils.copyProperties(cardBlacklistRequestDto, cardBlacklist);
        cardBlacklistRepository.save(cardBlacklist);
        BeanUtils.copyProperties(cardBlacklist, cardBlacklistResponseDto);

        //KARTIN ÇALIŞMA DURUMUNU PASİF YAP
        Optional<Card> cardOptional = cardRepository.findById(cardBlacklistRequestDto.getCard().getId());
        if (cardOptional.isPresent()) {
            Card card = cardOptional.get();

            //KART KARA LİSTEYE ALININCA PERSONELDEN KARTI KALDIRMA KODU GEREKTİĞİNDE EKLENİR
            /*Personnel personnel = personnelRepository.findByCardId(card.getId());
            if (personnel != null) {
                personnel.setCard(null); // veya personnel.setCardId(null);
                personnelRepository.save(personnel);
            }*/

            card.setActive(false);
            card.setDeactivatedAt(new Timestamp(System.currentTimeMillis()));
            cardRepository.save(card);
        }
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
        // Önce silinecek olan CardBlacklist kaydını bul
        Optional<CardBlacklist> blacklistOptional = cardBlacklistRepository.findById(id);

        if (blacklistOptional.isPresent()) {
            CardBlacklist blacklist = blacklistOptional.get();

            // Kara listedeki kartı bul
            Long cardId = blacklist.getCard().getId();
            Optional<Card> cardOptional = cardRepository.findById(cardId);

            if (cardOptional.isPresent()) {
                Card card = cardOptional.get();

                // Kartı aktif hale getir
                card.setActive(true);

                // deactivatedAt değerini açıkça null yap
                card.setDeactivatedAt(null);

                // Debug için yazdır
                System.out.println("Güncellemeden önce deactivatedAt: " + card.getDeactivatedAt());

                // Güncellenmiş kartı kaydet
                Card updatedCard = cardRepository.save(card);

                // Kaydedilmiş kartı tekrar kontrol et
                Card savedCard = cardRepository.findById(cardId).orElse(null);
                if (savedCard != null) {
                    System.out.println("Kaydedildikten sonra deactivatedAt: " + savedCard.getDeactivatedAt());
                }

                System.out.println("-------------------------------");
                System.out.println("Kart kara listeden çıkarıldı: " + card.getId() +
                        " " + card.getCardNumber() + " Aktif: " + card.getActive());
                System.out.println("-------------------------------");
            }

            // Son olarak kara liste kaydını sil
            cardBlacklistRepository.deleteById(id);
        } else {
            throw new EntityNotFoundException("CardBlacklist with ID " + id + " not found");
        }
    }

    @Override
    public boolean existsById(Long id) {
        return cardBlacklistRepository.existsById(id);
    }

    @Override
    public boolean existsByCard(Card card) {
        return cardBlacklistRepository.existsByCard(card);
    }
}
