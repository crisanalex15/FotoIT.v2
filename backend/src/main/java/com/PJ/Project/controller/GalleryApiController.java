package com.PJ.Project.controller;

import com.PJ.Project.dto.GalleryResponseDto;
import com.PJ.Project.service.GoogleDriveService;
import com.PJ.Project.service.WeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class GalleryApiController {

    private final WeddingService weddingService;

    @Autowired(required = false)
    private GoogleDriveService googleDriveService;

    @GetMapping("/{code}")
    public ResponseEntity<GalleryResponseDto> getGallery(
            @PathVariable String code,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "0") int size) {
        log.info("Cerere galerie pentru cod: {}, page: {}, size: {}", code, page, size);
        GalleryResponseDto gallery;
        if (page == 0 && size == 0) {
            gallery = weddingService.getGalleryByCode(code);
        } else {
            int pageSize = size > 0 ? size : 20;
            gallery = weddingService.getGalleryByCodePaginated(code, page, pageSize);
        }
        return ResponseEntity.ok(gallery);
    }

    /**
     * Endpoint optimizat pentru thumbnail:
     * - Genereaza o imagine mica (max 600px) si o salveaza in cache pe disc la prima cerere
     * - Serveste stream-ul direct fara a incarca in heap-ul Java fisiere de zeci de MB
     * - Trimite headere HTTP Cache-Control lungi (7 zile)
     */
    @GetMapping("/thumbnail/{fileId}")
    public ResponseEntity<StreamingResponseBody> getThumbnail(@PathVariable String fileId) {
        if (googleDriveService == null || !googleDriveService.isAvailable()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        try {
            StreamingResponseBody responseBody = outputStream -> {
                try (InputStream is = googleDriveService.getOptimizedThumbnailStream(fileId)) {
                    is.transferTo(outputStream);
                } catch (IOException e) {
                    log.error("Eroare la streaming thumbnail {}: {}", fileId, e.getMessage());
                }
            };

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE)
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=604800, immutable")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .body(responseBody);

        } catch (Exception e) {
            log.error("Eroare la pregatirea thumbnail-ului pentru fileId: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint optimizat pentru vizualizare imagine completa:
     * - Foloseste StreamingResponseBody direct din Google Drive catre client
     * - Consum RAM minim (~8KB buffer) indiferent de dimensiunea fotografiei
     */
    @GetMapping("/image/{fileId}")
    public ResponseEntity<StreamingResponseBody> getImage(@PathVariable String fileId) {
        if (googleDriveService == null || !googleDriveService.isAvailable()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        try {
            StreamingResponseBody responseBody = outputStream -> {
                try (InputStream is = googleDriveService.getFileStream(fileId)) {
                    is.transferTo(outputStream);
                } catch (IOException e) {
                    log.error("Eroare la streaming imagine {}: {}", fileId, e.getMessage());
                }
            };

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE)
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400, stale-while-revalidate=604800")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .body(responseBody);

        } catch (Exception e) {
            log.error("Eroare la pregatirea imaginii pentru fileId: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Descarcare fisier individual cu Content-Disposition attachment
     */
    @GetMapping("/download/{fileId}")
    public ResponseEntity<StreamingResponseBody> downloadImage(
            @PathVariable String fileId,
            @RequestParam(required = false) String filename) {
        if (googleDriveService == null || !googleDriveService.isAvailable()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        String finalFilename = (filename != null && !filename.isBlank()) ? filename : "foto_" + fileId + ".jpg";

        StreamingResponseBody responseBody = outputStream -> {
            try (InputStream is = googleDriveService.getFileStream(fileId)) {
                is.transferTo(outputStream);
            } catch (IOException e) {
                log.error("Eroare la descarcarea fisierului {}: {}", fileId, e.getMessage());
            }
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + finalFilename + "\"")
                .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                .body(responseBody);
    }

    /**
     * Descarcare multipla comprimata ZIP:
     * - Flux direct in outputStream (StreamingResponseBody + ZipOutputStream)
     * - NICIUN fisier nu este stocat integral in memoria RAM a serverului
     * - Previne erorile fatale OutOfMemoryError la descarcarea a sute de poze
     */
    @PostMapping("/download/zip")
    public ResponseEntity<StreamingResponseBody> downloadImagesAsZip(
            @RequestBody List<String> fileIds,
            @RequestParam(required = false) String galleryName) {
        if (googleDriveService == null || !googleDriveService.isAvailable()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        if (fileIds == null || fileIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String zipFilename = ((galleryName != null && !galleryName.isBlank()) ? galleryName : "galerie_fotoit") + ".zip";

        StreamingResponseBody responseBody = outputStream -> {
            try (ZipOutputStream zos = new ZipOutputStream(outputStream)) {
                int count = 0;
                for (String fileId : fileIds) {
                    try {
                        String filename = googleDriveService.getFileName(fileId);
                        if (filename == null || filename.isBlank()) {
                            filename = String.format("foto_%03d_%s.jpg", ++count, fileId);
                        }

                        zos.putNextEntry(new ZipEntry(filename));
                        try (InputStream is = googleDriveService.getFileStream(fileId)) {
                            is.transferTo(zos);
                        }
                        zos.closeEntry();
                    } catch (Exception e) {
                        log.warn("Nu s-a putut adauga fisierul {} in arhiva ZIP: {}", fileId, e.getMessage());
                    }
                }
                zos.finish();
            } catch (IOException e) {
                log.error("Eroare la generarea arhivei ZIP: {}", e.getMessage());
            }
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + zipFilename + "\"")
                .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                .body(responseBody);
    }
}
