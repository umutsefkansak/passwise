package com.umut.passwise.service.impl;

import com.umut.passwise.dto.requests.PersonnelRequestDto;
import com.umut.passwise.dto.responses.PersonnelResponseDto;
import com.umut.passwise.entities.Card;
import com.umut.passwise.entities.Personnel;
import com.umut.passwise.repository.CardRepository;
import com.umut.passwise.repository.PersonnelRepository;
import com.umut.passwise.service.abstracts.IFileStorageService;
import com.umut.passwise.service.abstracts.IPersonnelService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PersonnelServiceImpl implements IPersonnelService {

    private final PersonnelRepository personnelRepository;
    private final IFileStorageService fileStorageService;
    private final CardRepository cardRepository;

    @Autowired
    public PersonnelServiceImpl(PersonnelRepository personnelRepository, IFileStorageService fileStorageService, CardRepository cardRepository) {
        this.personnelRepository = personnelRepository;
        this.fileStorageService = fileStorageService;
        this.cardRepository = cardRepository;
    }

    @Override
    public List<PersonnelResponseDto> findAll() {
        List<Personnel> personnelList = personnelRepository.findAll();
        List<PersonnelResponseDto> dtoList = new ArrayList<>();

        for (Personnel personnel : personnelList) {
            PersonnelResponseDto dto = new PersonnelResponseDto();
            BeanUtils.copyProperties(personnel, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public List<PersonnelResponseDto> findAllByIsActiveTrue() {
        List<Personnel> personnelList = personnelRepository.findAllByIsActiveTrue();
        List<PersonnelResponseDto> dtoList = new ArrayList<>();

        for (Personnel personnel : personnelList) {
            PersonnelResponseDto dto = new PersonnelResponseDto();
            BeanUtils.copyProperties(personnel, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public List<PersonnelResponseDto> findAllByIsActiveFalse() {
        List<Personnel> personnelList = personnelRepository.findAllByIsActiveFalse();
        List<PersonnelResponseDto> dtoList = new ArrayList<>();

        for (Personnel personnel : personnelList) {
            PersonnelResponseDto dto = new PersonnelResponseDto();
            BeanUtils.copyProperties(personnel, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<PersonnelResponseDto> findById(Long id) {
        Optional<Personnel> personnel = personnelRepository.findById(id);

        if (personnel.isPresent()) {
            PersonnelResponseDto dto = new PersonnelResponseDto();
            BeanUtils.copyProperties(personnel.get(), dto);
            return Optional.of(dto);
        }

        return Optional.empty();
    }

    @Override
    public PersonnelResponseDto save(PersonnelRequestDto personnelRequestDto) {
        Personnel personnel = new Personnel();
        BeanUtils.copyProperties(personnelRequestDto, personnel);

        // Personeli kaydet
        Personnel savedPersonnel = personnelRepository.save(personnel);

        // Response DTO oluştur
        PersonnelResponseDto responseDto = new PersonnelResponseDto();
        BeanUtils.copyProperties(savedPersonnel, responseDto);

        return responseDto;
    }

//    @Override
//    public PersonnelResponseDto update(Long id, PersonnelRequestDto personnelRequestDto) {
//        Optional<Personnel> personnelOptional = personnelRepository.findById(id);
//
//        if (personnelOptional.isPresent()) {
//            Personnel personnel = personnelOptional.get();
//
//            // Eski fotoğraf adını sakla (silme işlemi için)
//            String oldPhotoFileName = personnel.getPhotoFileName();
//
//            // Yeni değerleri güncelle
//            BeanUtils.copyProperties(personnelRequestDto, personnel);
//            personnel.setId(id); // ID'nin korunduğundan emin ol
//
//            // Güncellenmiş personeli kaydet
//            Personnel updatedPersonnel = personnelRepository.save(personnel);
//
//            // Response DTO oluştur
//            PersonnelResponseDto responseDto = new PersonnelResponseDto();
//            BeanUtils.copyProperties(updatedPersonnel, responseDto);
//
//            return responseDto;
//        } else {
//            throw new EntityNotFoundException("Personnel with ID " + id + " not found");
//        }
//    }
@Override
public PersonnelResponseDto update(Long id, PersonnelRequestDto personnelRequestDto) {
    Optional<Personnel> personnelOptional = personnelRepository.findById(id);

    if (personnelOptional.isPresent()) {
        Personnel personnel = personnelOptional.get();

        // Eski fotoğraf adını sakla (silme işlemi için)
        String oldPhotoFileName = personnel.getPhotoFileName();

        System.out.println("---------------gelen temassiz no"+personnelRequestDto.getContactlessCardNumber());
        // Kart numarası işleme
        if (personnelRequestDto.getContactlessCardNumber() != null && !personnelRequestDto.getContactlessCardNumber().isEmpty()) {
            // Kart numarasını kullanarak kart arayın
            Optional<Card> cardOptional = cardRepository.findByCardNumber(personnelRequestDto.getContactlessCardNumber());

            if (cardOptional.isPresent()) {
                Card card = cardOptional.get();
                System.out.println("---------------------------------------Kart bulundu id:"+card.getId());
                // Kartı personele atayın
                personnelRequestDto.setCard(card);
                // Kartın personel referansını da güncelle
                card.setPersonel(personnel);
                cardRepository.save(card);

            } else {
                // Kart bulunamadıysa, yeni bir kart oluşturun (isteğe bağlı)
                // Bu kısmı iş mantığınıza göre düzenleyebilirsiniz
                throw new EntityNotFoundException("Card with number " + personnelRequestDto.getContactlessCardNumber() + " not found");
            }
        }


        // Yeni değerleri güncelle - contactlessCardNumber hariç diğer alanları kopyala
        BeanUtils.copyProperties(personnelRequestDto, personnel, "contactlessCardNumber");
        personnel.setId(id); // ID'nin korunduğundan emin ol

        // Güncellenmiş personeli kaydet
        Personnel updatedPersonnel = personnelRepository.save(personnel);

        // Response DTO oluştur
        PersonnelResponseDto responseDto = new PersonnelResponseDto();
        BeanUtils.copyProperties(updatedPersonnel, responseDto);

        return responseDto;
    } else {
        throw new EntityNotFoundException("Personnel with ID " + id + " not found");
    }
}

    @Override
    public void deleteById(Long id) {
        Optional<Personnel> personnel = personnelRepository.findById(id);

        if (personnel.isPresent() && personnel.get().getPhotoFileName() != null) {
            try {
                // Personelin fotoğrafını sil
                fileStorageService.deletePersonnelPhoto(personnel.get().getPhotoFileName());
            } catch (IOException e) {
                // Loglama yapılabilir
                System.err.println("Photo could not be deleted: " + e.getMessage());
            }
        }

        personnelRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return personnelRepository.existsById(id);
    }

    // PersonnelServiceImpl içindeki uploadPhoto metodunda değişiklik
    @Override
    public String uploadPhoto(Long id, MultipartFile file) throws IOException {
        // Personel var mı kontrol et
        Optional<Personnel> personnelOptional = personnelRepository.findById(id);

        if (!personnelOptional.isPresent()) {
            throw new EntityNotFoundException("Personnel with ID " + id + " not found");
        }

        Personnel personnel = personnelOptional.get();

        // Eski fotoğraf varsa sil
        if (personnel.getPhotoFileName() != null) {
            try {
                fileStorageService.deletePersonnelPhoto(personnel.getPhotoFileName());
            } catch (IOException e) {
                // Loglama yapılabilir
                System.err.println("Old photo could not be deleted: " + e.getMessage());
            }
        }

        // Yeni fotoğrafı kaydet - sadece ID kullanılacak
        String photoFileName = fileStorageService.storePersonnelPhoto(file, personnel.getId());

        // Personnel entity'sini güncelle
        personnel.setPhotoFileName(photoFileName);
        personnelRepository.save(personnel);

        return photoFileName;
    }


    @Override
    public void deletePhoto(Long id) throws IOException {
        // Personel var mı kontrol et
        Optional<Personnel> personnelOptional = personnelRepository.findById(id);

        if (!personnelOptional.isPresent()) {
            throw new EntityNotFoundException("Personnel with ID " + id + " not found");
        }

        Personnel personnel = personnelOptional.get();

        // Fotoğraf var mı kontrol et
        if (personnel.getPhotoFileName() == null || personnel.getPhotoFileName().isEmpty()) {
            throw new EntityNotFoundException("No photo found for personnel with ID " + id);
        }

        // Dosya sisteminden fotoğrafı sil
        fileStorageService.deletePersonnelPhoto(personnel.getPhotoFileName());

        // Veritabanındaki referansı kaldır
        personnel.setPhotoFileName(null);
        personnelRepository.save(personnel);
    }
}