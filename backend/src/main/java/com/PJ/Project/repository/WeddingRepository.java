package com.PJ.Project.repository;

import com.PJ.Project.entity.Wedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WeddingRepository extends JpaRepository<Wedding, Long> {
    Optional<Wedding> findByCode(String code);
    boolean existsByCode(String code);
}

