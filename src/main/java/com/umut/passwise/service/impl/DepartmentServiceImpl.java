package com.umut.passwise.service.impl;
import com.umut.passwise.dto.requests.DepartmentRequestDto;
import com.umut.passwise.dto.responses.DepartmentResponseDto;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.umut.passwise.entities.Department;
import com.umut.passwise.repository.DepartmentRepository;
import com.umut.passwise.service.abstracts.IDepartmentService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DepartmentServiceImpl implements IDepartmentService {

    private final DepartmentRepository departmentRepository;

    @Autowired
    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public List<DepartmentResponseDto> findAll() {
        List<Department> departmentlist = departmentRepository.findAll();
        List<DepartmentResponseDto> dtoList = new ArrayList<>();

        for(Department department: departmentlist){
            DepartmentResponseDto dto = new DepartmentResponseDto();
            BeanUtils.copyProperties(department, dto);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public Optional<DepartmentResponseDto> findById(Long id) {
        Optional<Department> department = departmentRepository.findById(id);

        // Eğer bulunmuşsa, kopyalama işlemi yapıyoruz
        if (department.isPresent()) {
            DepartmentResponseDto dto = new DepartmentResponseDto();
            BeanUtils.copyProperties(department.get(), dto);  // department.get() ile veriye ulaşıyoruz
            return Optional.of(dto);
        }

        return Optional.empty();  // Eğer veri yoksa boş döndürüyoruz
    }

    @Override
    public DepartmentResponseDto save(DepartmentRequestDto departmentRequestDto) {
        Department department = new Department();
        DepartmentResponseDto departmentResponseDto = new DepartmentResponseDto();

        BeanUtils.copyProperties(departmentRequestDto, department);

        departmentRepository.save(department);

        BeanUtils.copyProperties(department, departmentResponseDto);

        return departmentResponseDto;
    }

    @Override
    public DepartmentResponseDto update(Long id, DepartmentRequestDto departmentRequestDto) {
        // Mevcut entity'yi bul
        Optional<Department> departmentOptional = departmentRepository.findById(id);

        if (departmentOptional.isPresent()) {
            Department department = departmentOptional.get();

            // İlgili alanları güncelle
            BeanUtils.copyProperties(departmentRequestDto, department);

            // Güncellenmiş entity'yi kaydet
            departmentRepository.save(department);

            // Güncellenmiş entity'yi DTO'ya dönüştür
            DepartmentResponseDto departmentResponseDto = new DepartmentResponseDto();
            BeanUtils.copyProperties(department, departmentResponseDto);

            return departmentResponseDto;
        } else {
            // Eğer entity bulunamazsa hata fırlat
            throw new EntityNotFoundException("Department with ID " + id + " not found");
        }
    }

    @Override
    public void deleteById(Long id) {
        departmentRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return departmentRepository.existsById(id);
    }
}
