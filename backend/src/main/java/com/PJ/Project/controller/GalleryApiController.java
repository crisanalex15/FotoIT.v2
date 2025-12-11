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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
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
            @RequestParam(required = false, defaultValue = "5") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        GalleryResponseDto gallery;
        if (page == 0 && size == 20) {
            // Pentru compatibilitate, daca nu sunt parametri, returneaza toate pozele
            gallery = weddingService.getGalleryByCode(code);
        } else {
            gallery = weddingService.getGalleryByCodePaginated(code, page, size);
        }
        return ResponseEntity.ok(gallery);
    }
    // pentru a obtine thumbnail-ul imaginii
    @GetMapping("/thumbnail/{fileId}")
    public ResponseEntity<byte[]> getThumbnail(@PathVariable String fileId) {
        if (googleDriveService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
        
        try {
            // Descarca fisierul complet si il servim ca thumbnail
            // Browser-ul va incarca imaginea, dar CSS-ul o va face thumbnail
            byte[] fileBytes = googleDriveService.downloadFile(fileId);
            
            if (fileBytes != null && fileBytes.length > 0) {
                HttpHeaders headers = new HttpHeaders();
                // Detecteaza tipul real al imaginii sau foloseste IMAGE_JPEG ca default
                MediaType contentType = detectImageType(fileBytes);
                headers.setContentType(contentType);
                headers.setContentLength(fileBytes.length);
                headers.setCacheControl("public, max-age=3600");
                headers.set("Access-Control-Allow-Origin", "*");
                headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
                headers.set("Access-Control-Allow-Headers", "*");
                return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
            }
            
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            log.error("Eroare la descarcarea thumbnail-ului pentru fileId: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    // pentru a obtine imaginea completa
    @GetMapping("/image/{fileId}")
    public ResponseEntity<byte[]> getImage(@PathVariable String fileId) {
        if (googleDriveService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
        
        try {
            byte[] fileBytes = googleDriveService.downloadFile(fileId);
            
            if (fileBytes != null && fileBytes.length > 0) {
                HttpHeaders headers = new HttpHeaders();
                // Detecteaza tipul real al imaginii sau foloseste IMAGE_JPEG ca default
                MediaType contentType = detectImageType(fileBytes);
                headers.setContentType(contentType);
                headers.setContentLength(fileBytes.length);
                headers.setCacheControl("public, max-age=86400"); // Cache 24h pentru imagini complete
                headers.set("Access-Control-Allow-Origin", "*");
                headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
                headers.set("Access-Control-Allow-Headers", "*");
                return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
            }
            
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            log.error("Eroare la descarcarea imaginii pentru fileId: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Detecteaza tipul imaginii bazat pe header-urile magice (magic bytes)
     */
    private MediaType detectImageType(byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length < 4) {
            return MediaType.IMAGE_JPEG;
        }
        
        // Verifica magic bytes pentru diferite formate
        // JPEG: FF D8 FF
        if (imageBytes[0] == (byte)0xFF && imageBytes[1] == (byte)0xD8 && imageBytes[2] == (byte)0xFF) {
            return MediaType.IMAGE_JPEG;
        }
        // PNG: 89 50 4E 47
        if (imageBytes[0] == (byte)0x89 && imageBytes[1] == 0x50 && imageBytes[2] == 0x4E && imageBytes[3] == 0x47) {
            return MediaType.IMAGE_PNG;
        }
        // GIF: 47 49 46 38
        if (imageBytes[0] == 0x47 && imageBytes[1] == 0x49 && imageBytes[2] == 0x46 && imageBytes[3] == 0x38) {
            return MediaType.IMAGE_GIF;
        }
        // WebP: RIFF...WEBP
        if (imageBytes.length >= 12 && 
            imageBytes[0] == 0x52 && imageBytes[1] == 0x49 && imageBytes[2] == 0x46 && imageBytes[3] == 0x46 &&
            imageBytes[8] == 0x57 && imageBytes[9] == 0x45 && imageBytes[10] == 0x42 && imageBytes[11] == 0x50) {
            return MediaType.parseMediaType("image/webp");
        }
        
        // Default la JPEG daca nu se poate detecta
        return MediaType.IMAGE_JPEG;
    }

    // pentru a descarca imaginea completa
    @GetMapping("/download/{fileId}")
    public ResponseEntity<byte[]> downloadImage(@PathVariable String fileId, 
                                                @RequestParam(required = false) String filename) {
        if (googleDriveService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
        
        try {
            byte[] fileBytes = googleDriveService.downloadFile(fileId);
            
            if (fileBytes != null && fileBytes.length > 0) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                headers.setContentLength(fileBytes.length);
                headers.setContentDispositionFormData("attachment", 
                    filename != null ? filename : "image.jpg");
                return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
            }
            
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // pentru a descarca mai multe imagini ca ZIP
    @PostMapping("/download/zip")
    public ResponseEntity<byte[]> downloadImagesAsZip(@RequestBody List<String> fileIds,
                                                       @RequestParam(required = false) String galleryName) {
        if (googleDriveService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
        
        if (fileIds == null || fileIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ZipOutputStream zos = new ZipOutputStream(baos);
            
            int successCount = 0;
            for (String fileId : fileIds) {
                try {
                    byte[] fileBytes = googleDriveService.downloadFile(fileId);
                    if (fileBytes != null && fileBytes.length > 0) {
                        // Obtine numele fisierului
                        String filename = googleDriveService.getFileName(fileId);
                        if (filename == null || filename.isEmpty()) {
                            filename = "image_" + fileId + ".jpg";
                        }
                        
                        ZipEntry entry = new ZipEntry(filename);
                        zos.putNextEntry(entry);
                        zos.write(fileBytes);
                        zos.closeEntry();
                        successCount++;
                    }
                } catch (Exception e) {
                    log.warn("Nu s-a putut adauga fisierul {} in ZIP", fileId, e);
                }
            }
            
            zos.close();
            
            if (successCount == 0) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }
            
            byte[] zipBytes = baos.toByteArray();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentLength(zipBytes.length);
            String zipFilename = (galleryName != null ? galleryName : "galerie") + ".zip";
            headers.setContentDispositionFormData("attachment", zipFilename);
            
            log.info("Descarcat ZIP cu {} fisiere", successCount);
            return new ResponseEntity<>(zipBytes, headers, HttpStatus.OK);
            
        } catch (IOException e) {
            log.error("Eroare la crearea ZIP-ului", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

