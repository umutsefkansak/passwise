package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.ActionTypeRequestDto;
import com.umut.passwise.dto.responses.ActionTypeResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.ActionType;
import com.umut.passwise.repository.ActionTypeRepository;
import com.umut.passwise.service.abstracts.IActionTypeService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ActionTypeServiceImpl implements IActionTypeService {

    private final ActionTypeRepository actionTypeRepository;

    @Autowired
    public ActionTypeServiceImpl(ActionTypeRepository actionTypeRepository) {
        this.actionTypeRepository = actionTypeRepository;
    }

    @Override
    public List<ActionTypeResponseDto> findAll() {
        List<ActionType> actionTypelist = actionTypeRepository.findAll();
        List<ActionTypeResponseDto> dtoList = new ArrayList<>();

        for(ActionType actionType: actionTypelist){
            ActionTypeResponseDto dto = new ActionTypeResponseDto();
            BeanUtils.copyProperties(actionType, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<ActionTypeResponseDto> findById(Long id) {
        Optional<ActionType> actionType = actionTypeRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (actionType.isPresent()) {
            ActionTypeResponseDto dto = new ActionTypeResponseDto();
            BeanUtils.copyProperties(actionType.get(), dto);  // actionType.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public ActionTypeResponseDto save(ActionTypeRequestDto actionTypeRequestDto) {
        ActionType actionType = new ActionType();
        ActionTypeResponseDto actionTypeResponseDto = new ActionTypeResponseDto();

        BeanUtils.copyProperties(actionTypeRequestDto, actionType);

        actionTypeRepository.save(actionType);

        BeanUtils.copyProperties(actionType, actionTypeResponseDto);

        return actionTypeResponseDto;
    }

    @Override
    public ActionTypeResponseDto update(Long id, ActionTypeRequestDto actionTypeRequestDto) {
        // Mevcut entity'yi bul
        Optional<ActionType> actionTypeOptional = actionTypeRepository.findById(id);

        if (actionTypeOptional.isPresent()) {
            ActionType actionType = actionTypeOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(actionTypeRequestDto, actionType);

            // Güncellenmiş entity'yi kaydet
            actionTypeRepository.save(actionType);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            ActionTypeResponseDto actionTypeResponseDto = new ActionTypeResponseDto();
            BeanUtils.copyProperties(actionType, actionTypeResponseDto);

            return actionTypeResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("ActionType with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        actionTypeRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return actionTypeRepository.existsById(id);
    }
}
