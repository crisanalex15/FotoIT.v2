package com.PJ.Project.service;

import com.PJ.Project.dto.GalleryResponseDto;
import com.PJ.Project.dto.PhotoDto;
import com.PJ.Project.dto.WeddingDto;
import com.PJ.Project.dto.WeddingSummaryDto;
import com.PJ.Project.entity.EventType;
import com.PJ.Project.entity.Photo;
import com.PJ.Project.entity.Wedding;
import com.PJ.Project.exception.ResourceNotFoundException;
import com.PJ.Project.repository.PhotoRepository;
import com.PJ.Project.repository.WeddingRepository;
import com.google.api.services.drive.model.File;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Slf4j
public class WeddingService {

    private final WeddingRepository weddingRepository;
    private final PhotoRepository photoRepository;
    private final Random random = new Random();
    
    @Autowired(required = false)
    private GoogleDriveService googleDriveService;

    public WeddingService(WeddingRepository weddingRepository, PhotoRepository photoRepository) {
        this.weddingRepository = weddingRepository;
        this.photoRepository = photoRepository;
    }

    @Transactional
    public Wedding createWedding(WeddingDto weddingDto) {
        String code = generateUniqueCode();
        
        Wedding wedding = Wedding.builder()
                .code(code)
                .googleFolderId(weddingDto.getGoogleFolderId())
                .eventType(weddingDto.getEventType() != null ? weddingDto.getEventType() : EventType.EVENT)
                .name(weddingDto.getName() != null && !weddingDto.getName().isEmpty() 
                    ? weddingDto.getName() 
                    : "Eveniment " + code)
                .description(weddingDto.getDescription())
                .build();
        
        return weddingRepository.save(wedding);
    }

    @Transactional
    public int syncPhotosFromGoogleDrive(Long weddingId) throws IOException {
        if (googleDriveService == null) {
            throw new IllegalStateException("Google Drive Service nu este configurat. Adauga fisierul de credentiale in application.properties");
        }
        
        Wedding wedding = getWeddingById(weddingId);
        
        photoRepository.deleteByWedding(wedding);
        
        List<File> driveFiles = googleDriveService.listFilesInFolderRecursive(wedding.getGoogleFolderId());
        
        if (driveFiles.isEmpty()) {
            log.warn("Nu s-au gasit imagini in folderul {}", wedding.getGoogleFolderId());
            return 0;
        }
        
        List<Photo> photos = driveFiles.stream()
                .map(driveFile -> {
                    // Pentru imagini complete, folosim endpoint proxy in backend
                    // Acest endpoint va servi imaginile cu autentificare
                    String viewUrl = String.format("/api/gallery/image/%s", driveFile.getId());
                    // Pentru thumbnail-uri, folosim un endpoint proxy in backend
                    // Acest endpoint va servi thumbnail-urile cu autentificare
                    String thumbnailUrl = String.format("/api/gallery/thumbnail/%s", driveFile.getId());
                    
                    log.debug("Foto: {} - URL: {} - Thumbnail: {}", 
                            driveFile.getName(), viewUrl, thumbnailUrl);
                    
                    return Photo.builder()
                            .filename(driveFile.getName())
                            .url(viewUrl)
                            .thumbnailUrl(thumbnailUrl)
                            .fileId(driveFile.getId())
                            .wedding(wedding)
                            .build();
                })
                .collect(Collectors.toList());
        
        photoRepository.saveAll(photos);
        log.info("Sincronizate {} poze pentru eveniment {}", photos.size(), weddingId);
        return photos.size();
    }

    public GalleryResponseDto getGalleryByCode(String code) {
        Wedding wedding = getWeddingByCode(code);
        
        List<Photo> photos = photoRepository.findByWedding(wedding);
        
        List<PhotoDto> photoDtos = photos.stream()
                .map(photo -> PhotoDto.builder()
                        .id(photo.getId())
                        .filename(photo.getFilename())
                        .url(photo.getUrl())
                        .thumbnailUrl(photo.getThumbnailUrl())
                        .weddingId(wedding.getId())
                        .fileId(photo.getFileId())
                        .createdAt(photo.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        
        return GalleryResponseDto.builder()
                .code(wedding.getCode())
                .eventType(wedding.getEventType())
                .name(wedding.getName())
                .description(wedding.getDescription())
                .photos(photoDtos)
                .totalPhotos(photoDtos.size())
                .build();
    }

    public GalleryResponseDto getGalleryByCodePaginated(String code, int page, int size) {
        Wedding wedding = getWeddingByCode(code);
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<Photo> photoPage = photoRepository.findByWedding(wedding, pageable);
        
        List<PhotoDto> photoDtos = photoPage.getContent().stream()
                .map(photo -> PhotoDto.builder()
                        .id(photo.getId())
                        .filename(photo.getFilename())
                        .url(photo.getUrl())
                        .thumbnailUrl(photo.getThumbnailUrl())
                        .weddingId(wedding.getId())
                        .fileId(photo.getFileId())
                        .createdAt(photo.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        
        return GalleryResponseDto.builder()
                .code(wedding.getCode())
                .eventType(wedding.getEventType())
                .name(wedding.getName())
                .description(wedding.getDescription())
                .photos(photoDtos)
                .totalPhotos((int) photoPage.getTotalElements())
                .build();
    }

    public Wedding getWeddingById(Long id) {
        return weddingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Wedding", "id", id));
    }

    public Wedding getWeddingByCode(String code) {
        return weddingRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Wedding", "code", code));
    }

    @Transactional(readOnly = true)
    public List<WeddingSummaryDto> getAllWeddingsSummary() {
        List<Wedding> weddings = weddingRepository.findAll();
        return weddings.stream()
                .map(wedding -> WeddingSummaryDto.builder()
                        .id(wedding.getId())
                        .code(wedding.getCode())
                        .eventType(wedding.getEventType())
                        .name(wedding.getName())
                        .description(wedding.getDescription())
                        .photoCount(photoRepository.countByWedding(wedding))
                        .build())
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<Wedding> getAllWeddings() {
        return weddingRepository.findAll();
    }

    @Transactional
    public void deleteWedding(Long id) {
        Wedding wedding = getWeddingById(id);
        weddingRepository.delete(wedding);
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = generateCode();
        } while (weddingRepository.existsByCode(code));
        return code;
    }

    private String generateCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }
}

