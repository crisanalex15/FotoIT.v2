package com.PJ.Project.repository;

import com.PJ.Project.entity.Photo;
import com.PJ.Project.entity.Wedding;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByWeddingOrderByFilenameAsc(Wedding wedding);
    Page<Photo> findByWedding(Wedding wedding, Pageable pageable);
    void deleteByWedding(Wedding wedding);
    long countByWedding(Wedding wedding);

    /** Folosit ca sa servim doar fisiere care apartin unei galerii, nu orice fisier din Drive. */
    boolean existsByFileId(String fileId);

    Optional<Photo> findFirstByFileId(String fileId);

    List<Photo> findByWeddingAndFileIdIn(Wedding wedding, Collection<String> fileIds);
}
