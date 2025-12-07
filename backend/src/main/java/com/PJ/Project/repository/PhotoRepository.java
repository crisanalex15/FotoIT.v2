package com.PJ.Project.repository;

import com.PJ.Project.entity.Photo;
import com.PJ.Project.entity.Wedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByWedding(Wedding wedding);
    void deleteByWedding(Wedding wedding);
}

