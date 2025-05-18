package com.umut.passwise.repository;

import com.umut.passwise.entities.Personnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonnelRepository extends JpaRepository<Personnel,Long> {
    List<Personnel> findAllByIsActiveTrue();
    List<Personnel> findAllByIsActiveFalse();

    Personnel findByCardId(Long id);




    // Aktif personelleri getir
    List<Personnel> findByIsActiveTrue();

    // Aktif olmayan personelleri getir
    List<Personnel> findByIsActiveFalse();

    // Belirli bir personel tipine sahip aktif personel sayısı
    int countByIsActiveTrueAndPersonTypeName(String personTypeName);

    // Belirli bir personel tipi dışındaki aktif personel sayısı
    int countByIsActiveTrueAndPersonTypeNameNot(String personTypeName);

    // Varlık kontrolü
    boolean existsById(Long id);


}
