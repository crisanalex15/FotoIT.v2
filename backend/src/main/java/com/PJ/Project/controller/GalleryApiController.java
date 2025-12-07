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
    public ResponseEntity<GalleryResponseDto> getGallery(@PathVariable String code) {
        GalleryResponseDto gallery = weddingService.getGalleryByCode(code);
        return ResponseEntity.ok(gallery);
    }

    @GetMapping("/thumbnail/{fileId}")
    public ResponseEntity<byte[]> getThumbnail(@PathVariable String fileId) {
        if (googleDriveService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
        
        try {
            // Descarcă fișierul complet și îl servim ca thumbnail
            // Browser-ul va încărca imaginea, dar CSS-ul o va face thumbnail
            byte[] fileBytes = googleDriveService.downloadFile(fileId);
            
            if (fileBytes != null && fileBytes.length > 0) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.IMAGE_JPEG);
                headers.setContentLength(fileBytes.length);
                headers.setCacheControl("public, max-age=3600");
                return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
            }
            
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/image/{fileId}")
    public ResponseEntity<byte[]> getImage(@PathVariable String fileId) {
        if (googleDriveService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
        
        try {
            byte[] fileBytes = googleDriveService.downloadFile(fileId);
            
            if (fileBytes != null && fileBytes.length > 0) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.IMAGE_JPEG);
                headers.setContentLength(fileBytes.length);
                headers.setCacheControl("public, max-age=86400"); // Cache 24h pentru imagini complete
                return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
            }
            
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

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
                        // Obține numele fișierului
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
                    log.warn("Nu s-a putut adăuga fișierul {} în ZIP", fileId, e);
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
            
            log.info("Descărcat ZIP cu {} fișiere", successCount);
            return new ResponseEntity<>(zipBytes, headers, HttpStatus.OK);
            
        } catch (IOException e) {
            log.error("Eroare la crearea ZIP-ului", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

