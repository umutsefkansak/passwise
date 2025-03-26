package com.umut.passwise.repository;


import com.umut.passwise.entities.Door;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoorRepository extends JpaRepository<Door,Long> {
}
