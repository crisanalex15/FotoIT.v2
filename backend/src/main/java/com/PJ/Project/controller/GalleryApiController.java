package com.PJ.Project.controller;

import com.PJ.Project.dto.GalleryResponseDto;
import com.PJ.Project.entity.Photo;
import com.PJ.Project.service.GoogleDriveService;
import com.PJ.Project.service.WeddingService;
import com.google.api.services.drive.model.File;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.zip.Deflater;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
@Slf4j
public class GalleryApiController {

    private static final int MAX_PAGE_SIZE = 200;

    private final WeddingService weddingService;
    private final GoogleDriveService googleDriveService;

    @Value("${app.zip.max-files:500}")
    private int maxZipFiles;

    /**
     * Fara parametri returneaza toata galeria. Cu ?page=N&size=M returneaza o pagina (pentru incarcare treptata).
     */
    @GetMapping("/{code}")
    public ResponseEntity<GalleryResponseDto> getGallery(
            @PathVariable String code,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        String normalized = normalizeCode(code);
        GalleryResponseDto gallery = (page == null && size == null)
                ? weddingService.getGalleryByCode(normalized)
                : weddingService.getGalleryByCodePaginated(normalized,
                        page != null ? page : 0,
                        Math.min(size != null && size > 0 ? size : 40, MAX_PAGE_SIZE));
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(gallery);
    }

    @GetMapping("/thumbnail/{fileId}")
    public ResponseEntity<Resource> getThumbnail(@PathVariable String fileId) throws IOException {
        ResponseEntity<Resource> rejected = rejectUnknown(fileId);
        if (rejected != null) return rejected;

        Path thumb = googleDriveService.getThumbnail(fileId);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic().immutable())
                .body(new FileSystemResource(thumb));
    }

    /** Versiune redimensionata (max 2048px) pentru vizualizarea pe tot ecranul. */
    @GetMapping("/preview/{fileId}")
    public ResponseEntity<Resource> getPreview(@PathVariable String fileId) throws IOException {
        ResponseEntity<Resource> rejected = rejectUnknown(fileId);
        if (rejected != null) return rejected;

        Path preview = googleDriveService.getPreview(fileId);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic().immutable())
                .body(new FileSystemResource(preview));
    }

    /** Fisierul original, afisat in browser. */
    @GetMapping("/image/{fileId}")
    public ResponseEntity<StreamingResponseBody> getImage(@PathVariable String fileId) throws IOException {
        ResponseEntity<StreamingResponseBody> rejected = rejectUnknown(fileId);
        if (rejected != null) return rejected;

        File meta = googleDriveService.getFileMetadata(fileId);
        return streamFile(fileId, meta, disposition("inline", safeName(meta.getName(), fileId)),
                CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic());
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<StreamingResponseBody> downloadImage(@PathVariable String fileId) throws IOException {
        ResponseEntity<StreamingResponseBody> rejected = rejectUnknown(fileId);
        if (rejected != null) return rejected;

        File meta = googleDriveService.getFileMetadata(fileId);
        String name = safeName(weddingService.getPhotoFilename(fileId), fileId);
        return streamFile(fileId, meta, disposition("attachment", name),
                CacheControl.noStore());
    }

    /**
     * Arhiva ZIP pentru pozele selectate. Toate pozele trebuie sa apartina galeriei cu codul dat.
     * Arhiva se scrie direct in raspuns, fara a tine pozele in memorie.
     */
    @PostMapping(value = "/download/zip", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<StreamingResponseBody> downloadImagesAsZip(
            @RequestParam String code,
            @RequestBody List<String> fileIds,
            @RequestParam(required = false) String galleryName) {
        return selectedZip(code, fileIds, galleryName);
    }

    /**
     * Aceeasi arhiva, trimisa dintr-un formular HTML. Browserul descarca nativ (cu bara lui de progres),
     * iar pagina nu tine arhiva in memorie.
     */
    @PostMapping(value = "/download/zip", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<StreamingResponseBody> downloadImagesAsZipForm(
            @RequestParam String code,
            @RequestParam List<String> fileIds,
            @RequestParam(required = false) String galleryName) {
        return selectedZip(code, fileIds, galleryName);
    }

    private ResponseEntity<StreamingResponseBody> selectedZip(String code, List<String> fileIds, String galleryName) {
        if (!googleDriveService.isAvailable()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
        if (fileIds == null || fileIds.isEmpty()) {
            throw new IllegalArgumentException("Nu a fost selectata nicio fotografie.");
        }
        if (fileIds.size() > maxZipFiles) {
            throw new IllegalArgumentException("Poti descarca maxim " + maxZipFiles + " fotografii o data.");
        }
        if (fileIds.stream().anyMatch(id -> !GoogleDriveService.isValidFileId(id))) {
            throw new IllegalArgumentException("ID de fisier invalid.");
        }

        List<Photo> photos = weddingService.getPhotosForDownload(normalizeCode(code), fileIds);
        return zipResponse(photos, galleryName);
    }

    /**
     * Toata galeria ca ZIP, printr-un simplu GET. Browserul descarca direct (cu bara lui de progres),
     * fara ca pagina sa tina arhiva in memorie.
     */
    @GetMapping("/{code}/download-all")
    public ResponseEntity<StreamingResponseBody> downloadAll(@PathVariable String code) {
        if (!googleDriveService.isAvailable()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
        String normalized = normalizeCode(code);
        List<Photo> photos = weddingService.getAllPhotosForCode(normalized);
        if (photos.isEmpty()) {
            throw new IllegalArgumentException("Galeria nu contine fotografii.");
        }
        return zipResponse(photos, weddingService.getWeddingByCode(normalized).getName());
    }

    private ResponseEntity<StreamingResponseBody> zipResponse(List<Photo> photos, String galleryName) {
        String zipName = safeName(galleryName, "galerie_fotoit").replaceAll("(?i)\\.zip$", "") + ".zip";

        StreamingResponseBody body = outputStream -> {
            Set<String> usedNames = new HashSet<>();
            try (ZipOutputStream zos = new ZipOutputStream(outputStream, StandardCharsets.UTF_8)) {
                // JPEG-urile sunt deja comprimate; fara compresie economisim CPU
                zos.setLevel(Deflater.NO_COMPRESSION);
                int index = 0;
                for (Photo photo : photos) {
                    index++;
                    String entryName = uniqueName(safeName(photo.getFilename(), "foto_" + index + ".jpg"), usedNames);
                    try (InputStream is = googleDriveService.getFileStream(photo.getFileId())) {
                        zos.putNextEntry(new ZipEntry(entryName));
                        is.transferTo(zos);
                        zos.closeEntry();
                    } catch (IOException e) {
                        // O singura poza lipsa nu trebuie sa strice toata arhiva
                        log.warn("Fisierul {} nu a putut fi adaugat in ZIP: {}", photo.getFileId(), e.getMessage());
                    }
                }
                zos.finish();
            }
        };

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/zip"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        disposition("attachment", zipName).toString())
                .cacheControl(CacheControl.noStore())
                .body(body);
    }

    // ------------------------------------------------------------------ utilitare

    private <T> ResponseEntity<T> rejectUnknown(String fileId) {
        if (!googleDriveService.isAvailable()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
        // Servim doar fisiere care apartin unei galerii, nu orice fisier accesibil contului de serviciu
        if (!GoogleDriveService.isValidFileId(fileId) || !weddingService.isKnownPhoto(fileId)) {
            return ResponseEntity.notFound().build();
        }
        return null;
    }

    private ResponseEntity<StreamingResponseBody> streamFile(String fileId, File meta,
                                                             ContentDisposition disposition,
                                                             CacheControl cacheControl) {
        String mime = meta.getMimeType();
        MediaType contentType = mime != null && GoogleDriveService.IMAGE_MIME_TYPES.contains(mime)
                ? MediaType.parseMediaType(mime)
                : MediaType.APPLICATION_OCTET_STREAM;

        // Daca transferul se intrerupe, exceptia inchide conexiunea, iar browserul vede
        // (datorita Content-Length) ca fisierul e incomplet, in loc sa salveze o poza taiata.
        StreamingResponseBody body = outputStream -> {
            try (InputStream is = googleDriveService.getFileStream(fileId)) {
                is.transferTo(outputStream);
            }
        };

        ResponseEntity.BodyBuilder builder = ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(cacheControl);
        if (meta.getSize() != null && meta.getSize() > 0) {
            builder.contentLength(meta.getSize());
        }
        return builder.body(body);
    }

    /** Nume simplu pentru fisiere ASCII; pentru diacritice se adauga si varianta filename* (RFC 5987). */
    private static ContentDisposition disposition(String type, String filename) {
        ContentDisposition.Builder b = ContentDisposition.builder(type);
        boolean ascii = filename.chars().allMatch(c -> c >= 32 && c < 127);
        return (ascii ? b.filename(filename) : b.filename(filename, StandardCharsets.UTF_8)).build();
    }

    private static String normalizeCode(String code) {
        String c = code == null ? "" : code.trim().toUpperCase();
        if (!c.matches("^[A-Z0-9]{4,12}$")) {
            throw new IllegalArgumentException("Cod de galerie invalid.");
        }
        return c;
    }

    /** Elimina caracterele periculoase din numele de fisier (cai, ghilimele, caractere de control). */
    private static String safeName(String name, String fallback) {
        if (name == null || name.isBlank()) return fallback;
        String cleaned = name.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "_").trim();
        cleaned = cleaned.replaceAll("^\\.+", "");
        if (cleaned.isEmpty()) return fallback;
        return cleaned.length() > 150 ? cleaned.substring(0, 150) : cleaned;
    }

    private static String uniqueName(String name, Set<String> used) {
        if (used.add(name.toLowerCase())) return name;
        int dot = name.lastIndexOf('.');
        String base = dot > 0 ? name.substring(0, dot) : name;
        String ext = dot > 0 ? name.substring(dot) : "";
        for (int i = 2; ; i++) {
            String candidate = base + " (" + i + ")" + ext;
            if (used.add(candidate.toLowerCase())) return candidate;
        }
    }
}
