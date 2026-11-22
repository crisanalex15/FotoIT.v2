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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.SecureRandom;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class WeddingService {

    private final WeddingRepository weddingRepository;
    private final PhotoRepository photoRepository;
    private final SecureRandom random = new SecureRandom();

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
                .googleFolderId(extractFolderId(weddingDto.getGoogleFolderId()))
                .eventType(weddingDto.getEventType() != null ? weddingDto.getEventType() : EventType.EVENT)
                .name(weddingDto.getName() != null && !weddingDto.getName().isEmpty()
                        ? weddingDto.getName()
                        : "Eveniment " + code)
                .description(blankToNull(weddingDto.getDescription()))
                .build();

        return weddingRepository.save(wedding);
    }

    /** Modifica numele, tipul, descrierea sau folderul unui eveniment existent. */
    @Transactional
    public Wedding updateWedding(Long id, WeddingDto dto) {
        Wedding wedding = getWeddingById(id);
        if (dto.getName() != null && !dto.getName().isBlank()) {
            wedding.setName(dto.getName().trim());
        }
        if (dto.getEventType() != null) {
            wedding.setEventType(dto.getEventType());
        }
        wedding.setDescription(blankToNull(dto.getDescription()));
        if (dto.getGoogleFolderId() != null && !dto.getGoogleFolderId().isBlank()) {
            String folderId = extractFolderId(dto.getGoogleFolderId());
            if (!folderId.equals(wedding.getGoogleFolderId())) {
                wedding.setGoogleFolderId(folderId);
                wedding.setLastSyncedAt(null); // folder nou: pozele trebuie resincronizate
            }
        }
        return weddingRepository.save(wedding);
    }

    /**
     * Accepta fie ID-ul folderului, fie link-ul copiat din Google Drive
     * (ex: https://drive.google.com/drive/folders/1AbC...?usp=sharing).
     */
    public static String extractFolderId(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Introdu link-ul sau ID-ul folderului din Google Drive.");
        }
        String value = input.trim();
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("(?:folders/|[?&]id=)([A-Za-z0-9_-]{10,})")
                .matcher(value);
        if (m.find()) {
            value = m.group(1);
        }
        if (!GoogleDriveService.isValidFileId(value)) {
            throw new IllegalArgumentException("Link-ul sau ID-ul folderului Google Drive nu este valid.");
        }
        return value;
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    @Transactional(readOnly = true)
    public List<Photo> getPhotosForWedding(Long weddingId) {
        return photoRepository.findByWeddingOrderByFilenameAsc(getWeddingById(weddingId));
    }

    @Transactional
    public int syncPhotosFromGoogleDrive(Long weddingId) throws IOException {
        if (googleDriveService == null || !googleDriveService.isAvailable()) {
            throw new IllegalStateException("Google Drive Service nu este configurat. Adauga GOOGLE_CREDENTIALS_JSON sau fisierul de credentiale in application.properties");
        }

        Wedding wedding = getWeddingById(weddingId);

        photoRepository.deleteByWedding(wedding);

        List<File> driveFiles = googleDriveService.listFilesInFolderRecursive(wedding.getGoogleFolderId());

        wedding.setLastSyncedAt(java.time.LocalDateTime.now());
        weddingRepository.save(wedding);

        if (driveFiles.isEmpty()) {
            log.warn("Nu s-au gasit imagini in folderul {}", wedding.getGoogleFolderId());
            return 0;
        }

        List<Photo> photos = driveFiles.stream()
                .map(driveFile -> {
                    String viewUrl = String.format("/api/gallery/image/%s", driveFile.getId());
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

        // Thumbnail-urile se genereaza in fundal, ca primii vizitatori sa nu astepte dupa ele
        googleDriveService.warmThumbnailsAsync(photos.stream().map(Photo::getFileId).toList());
        return photos.size();
    }

    @Transactional(readOnly = true)
    public GalleryResponseDto getGalleryByCode(String code) {
        Wedding wedding = getWeddingByCode(code);
        List<PhotoDto> photoDtos = photoRepository.findByWeddingOrderByFilenameAsc(wedding).stream()
                .map(photo -> toDto(photo, wedding))
                .collect(Collectors.toList());

        return GalleryResponseDto.builder()
                .code(wedding.getCode())
                .eventType(wedding.getEventType())
                .name(wedding.getName())
                .description(wedding.getDescription())
                .photos(photoDtos)
                .totalPhotos(photoDtos.size())
                .page(0)
                .hasMore(false)
                .build();
    }

    @Transactional(readOnly = true)
    public GalleryResponseDto getGalleryByCodePaginated(String code, int page, int size) {
        Wedding wedding = getWeddingByCode(code);

        Pageable pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("filename").ascending());
        Page<Photo> photoPage = photoRepository.findByWedding(wedding, pageable);

        List<PhotoDto> photoDtos = photoPage.getContent().stream()
                .map(photo -> toDto(photo, wedding))
                .collect(Collectors.toList());

        return GalleryResponseDto.builder()
                .code(wedding.getCode())
                .eventType(wedding.getEventType())
                .name(wedding.getName())
                .description(wedding.getDescription())
                .photos(photoDtos)
                .totalPhotos((int) photoPage.getTotalElements())
                .page(photoPage.getNumber())
                .hasMore(photoPage.hasNext())
                .build();
    }

    private PhotoDto toDto(Photo photo, Wedding wedding) {
        return PhotoDto.builder()
                .id(photo.getId())
                .filename(photo.getFilename())
                .url(photo.getUrl())
                .thumbnailUrl(photo.getThumbnailUrl())
                .weddingId(wedding.getId())
                .fileId(photo.getFileId())
                .createdAt(photo.getCreatedAt())
                .build();
    }

    /**
     * Verifica faptul ca toate fisierele cerute apartin galeriei cu codul dat.
     * Returneaza lista de fisiere (fileId + nume) in ordinea ceruta, fara duplicate.
     */
    @Transactional(readOnly = true)
    public List<Photo> getPhotosForDownload(String code, List<String> fileIds) {
        Wedding wedding = getWeddingByCode(code);
        Set<String> requested = new LinkedHashSet<>(fileIds);
        Map<String, Photo> found = photoRepository.findByWeddingAndFileIdIn(wedding, requested).stream()
                .collect(Collectors.toMap(Photo::getFileId, p -> p, (a, b) -> a));
        if (found.size() != requested.size()) {
            throw new IllegalArgumentException("Unele fotografii nu apartin acestei galerii.");
        }
        return requested.stream().map(found::get).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Photo> getAllPhotosForCode(String code) {
        return photoRepository.findByWeddingOrderByFilenameAsc(getWeddingByCode(code));
    }

    @Transactional(readOnly = true)
    public boolean isKnownPhoto(String fileId) {
        return photoRepository.existsByFileId(fileId);
    }

    @Transactional(readOnly = true)
    public String getPhotoFilename(String fileId) {
        return photoRepository.findFirstByFileId(fileId).map(Photo::getFilename).orElse(null);
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
        List<Wedding> weddings = weddingRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return weddings.stream()
                .map(wedding -> WeddingSummaryDto.builder()
                        .id(wedding.getId())
                        .code(wedding.getCode())
                        .eventType(wedding.getEventType())
                        .name(wedding.getName())
                        .description(wedding.getDescription())
                        .photoCount(photoRepository.countByWedding(wedding))
                        .googleFolderId(wedding.getGoogleFolderId())
                        .createdAt(wedding.getCreatedAt())
                        .lastSyncedAt(wedding.getLastSyncedAt())
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
        List<String> fileIds = photoRepository.findByWeddingOrderByFilenameAsc(wedding).stream()
                .map(Photo::getFileId)
                .toList();
        weddingRepository.delete(wedding);
        if (googleDriveService != null) {
            googleDriveService.deleteCachedThumbnails(fileIds);
        }
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
