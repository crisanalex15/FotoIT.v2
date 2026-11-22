package com.PJ.Project.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.HttpResponse;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReadParam;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.regex.Pattern;

@Service
@Slf4j
public class GoogleDriveService {

    /** ID-urile Google Drive contin doar litere, cifre, '-' si '_' */
    private static final Pattern FILE_ID_PATTERN = Pattern.compile("^[A-Za-z0-9_-]{10,200}$");

    public static final Set<String> IMAGE_MIME_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "image/bmp", "image/tiff", "image/heic", "image/heif"
    );

    /** Variantele redimensionate pastrate in cache. */
    public enum Variant {
        // "_t" (nu "") ca thumbnail-urile vechi, generate fara rotire EXIF, sa fie regenerate
        THUMB("_t", 0.85f),
        PREVIEW("_preview", 0.86f);

        final String suffix;
        final float quality;

        Variant(String suffix, float quality) {
            this.suffix = suffix;
            this.quality = quality;
        }
    }

    private final Drive driveService;
    private final Path cacheDir;
    private final int maxSize;
    private final int previewSize;
    private final Semaphore generationSlots;
    /** Un singur fir genereaza un anumit thumbnail; celelalte cereri asteapta rezultatul. */
    private final ConcurrentHashMap<String, Object> generationLocks = new ConcurrentHashMap<>();
    private final ExecutorService warmupExecutor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "thumbnail-warmup");
        t.setDaemon(true);
        return t;
    });

    public GoogleDriveService(@Autowired(required = false) Drive driveService,
                              @Value("${app.thumbnails.cache-dir:cache/thumbnails}") String cacheDir,
                              @Value("${app.thumbnails.max-size:800}") int maxSize,
                              @Value("${app.previews.max-size:2048}") int previewSize,
                              @Value("${app.thumbnails.max-concurrent:2}") int maxConcurrent) {
        this.driveService = driveService;
        this.cacheDir = Paths.get(cacheDir).toAbsolutePath().normalize();
        this.maxSize = maxSize;
        this.previewSize = previewSize;
        this.generationSlots = new Semaphore(Math.max(1, maxConcurrent));
        try {
            Files.createDirectories(this.cacheDir);
        } catch (IOException e) {
            log.warn("Nu s-a putut crea directorul de cache: {}", this.cacheDir, e);
        }
    }

    @PreDestroy
    void shutdown() {
        warmupExecutor.shutdownNow();
    }

    public boolean isAvailable() {
        return driveService != null;
    }

    public static boolean isValidFileId(String fileId) {
        return fileId != null && FILE_ID_PATTERN.matcher(fileId).matches();
    }

    // ------------------------------------------------------------------ listare

    public List<File> listFilesInFolderRecursive(String folderId) throws IOException {
        checkAvailability();
        if (!isValidFileId(folderId)) {
            throw new IllegalArgumentException("ID de folder Google Drive invalid: " + folderId);
        }
        log.info("Listare recursiva fisiere din folder: {}", folderId);
        List<File> allImages = new ArrayList<>();
        listFilesRecursive(folderId, allImages);
        log.info("Gasite {} imagini in folder {}", allImages.size(), folderId);
        return allImages;
    }

    private void listFilesRecursive(String folderId, List<File> allImages) throws IOException {
        String pageToken = null;
        do {
            String query = String.format("'%s' in parents and trashed=false", folderId);
            FileList result = driveService.files().list()
                    .setQ(query)
                    .setPageSize(1000)
                    .setFields("nextPageToken, files(id, name, mimeType)")
                    .setPageToken(pageToken)
                    .execute();

            List<File> items = result.getFiles();
            if (items != null) {
                for (File item : items) {
                    if ("application/vnd.google-apps.folder".equals(item.getMimeType())) {
                        listFilesRecursive(item.getId(), allImages);
                    } else if (item.getMimeType() != null && IMAGE_MIME_TYPES.contains(item.getMimeType())) {
                        allImages.add(item);
                    }
                }
            }
            pageToken = result.getNextPageToken();
        } while (pageToken != null);
    }

    // ------------------------------------------------------------------ fisiere

    /** Metadatele unui fisier: nume, tip si dimensiune (pentru header-ele HTTP). */
    public File getFileMetadata(String fileId) throws IOException {
        checkAvailability();
        requireValidId(fileId);
        return driveService.files().get(fileId)
                .setFields("id, name, mimeType, size")
                .execute();
    }

    /** Stream direct din Google Drive, fara a incarca fisierul in memorie. */
    public InputStream getFileStream(String fileId) throws IOException {
        checkAvailability();
        requireValidId(fileId);
        return driveService.files().get(fileId).executeMediaAsInputStream();
    }

    // ------------------------------------------------------------------ thumbnail-uri

    /**
     * Returneaza calea catre thumbnail-ul din cache, generandu-l daca nu exista.
     * Generarea se face inainte de a trimite raspunsul, deci o eroare devine un status HTTP corect.
     */
    public Path getThumbnail(String fileId) throws IOException {
        return getResized(fileId, Variant.THUMB);
    }

    /** Versiune mare (implicit 2048px) pentru vizualizarea pe tot ecranul. */
    public Path getPreview(String fileId) throws IOException {
        return getResized(fileId, Variant.PREVIEW);
    }

    private Path getResized(String fileId, Variant variant) throws IOException {
        checkAvailability();
        requireValidId(fileId);
        Path cached = cachePath(fileId, variant);
        if (Files.exists(cached)) {
            return cached;
        }

        String lockKey = fileId + variant.suffix;
        Object lock = generationLocks.computeIfAbsent(lockKey, k -> new Object());
        try {
            synchronized (lock) {
                if (Files.exists(cached)) {
                    return cached;
                }
                generationSlots.acquireUninterruptibly();
                try {
                    generateResized(fileId, cached, variant);
                } finally {
                    generationSlots.release();
                }
                return cached;
            }
        } finally {
            generationLocks.remove(lockKey, lock);
        }
    }

    /** Genereaza thumbnail-urile in fundal dupa o sincronizare (cate unul pe rand). */
    public void warmThumbnailsAsync(List<String> fileIds) {
        if (!isAvailable() || fileIds == null || fileIds.isEmpty()) return;
        List<String> copy = List.copyOf(fileIds);
        warmupExecutor.submit(() -> {
            int ok = 0;
            for (String id : copy) {
                if (Thread.currentThread().isInterrupted()) return;
                try {
                    getThumbnail(id);
                    ok++;
                } catch (Exception e) {
                    log.warn("Pre-generare thumbnail esuata pentru {}: {}", id, e.getMessage());
                }
            }
            log.info("Pre-generate {}/{} thumbnail-uri", ok, copy.size());
        });
    }

    public void deleteCachedThumbnails(List<String> fileIds) {
        for (String id : fileIds) {
            if (!isValidFileId(id)) continue;
            try {
                for (Variant v : Variant.values()) {
                    Files.deleteIfExists(cachePath(id, v));
                }
            } catch (IOException e) {
                log.debug("Nu s-a putut sterge thumbnail-ul {}: {}", id, e.getMessage());
            }
        }
    }

    private void generateResized(String fileId, Path target, Variant variant) throws IOException {
        int targetSize = variant == Variant.PREVIEW ? previewSize : maxSize;
        Path original = Files.createTempFile(cacheDir, "orig-", ".tmp");
        Path tmpThumb = Files.createTempFile(cacheDir, "thumb-", ".tmp");
        try {
            // 1. Originalul se copiaza pe disc (nu in RAM)
            try (InputStream in = getFileStream(fileId)) {
                Files.copy(in, original, StandardCopyOption.REPLACE_EXISTING);
            }

            // 2. Decodare la rezolutie redusa + rotire dupa EXIF
            BufferedImage thumb = null;
            try {
                BufferedImage decoded = decodeSubsampled(original, targetSize);
                if (decoded != null) {
                    thumb = applyOrientation(resize(decoded, targetSize), readExifOrientation(original));
                }
            } catch (Exception e) {
                log.warn("Decodare esuata pentru {} ({}), se incearca thumbnail-ul Google", fileId, e.getMessage());
            }

            // 3. Format nesuportat de Java (ex: HEIC) -> thumbnail-ul generat de Google Drive
            if (thumb == null) {
                downloadDriveThumbnail(fileId, tmpThumb, targetSize);
            } else {
                writeJpeg(thumb, tmpThumb, variant.quality);
            }

            Files.move(tmpThumb, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } finally {
            Files.deleteIfExists(original);
            Files.deleteIfExists(tmpThumb);
        }
    }

    /**
     * Citeste imaginea sarind peste pixeli (subsampling), astfel incat o poza de 6000px
     * sa ocupe in memorie cateva MB in loc de ~150MB.
     */
    private BufferedImage decodeSubsampled(Path file, int targetSize) throws IOException {
        try (ImageInputStream iis = ImageIO.createImageInputStream(file.toFile())) {
            if (iis == null) return null;
            Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
            if (!readers.hasNext()) return null;
            ImageReader reader = readers.next();
            try {
                reader.setInput(iis, true, true);
                int w = reader.getWidth(0);
                int h = reader.getHeight(0);
                // Pentru thumbnail pastram dublul dimensiunii finale (micsorare de calitate);
                // pentru preview e suficienta dimensiunea finala, ca sa nu decodam 100MB+ in RAM
                int keep = targetSize <= 1000 ? targetSize * 2 : targetSize;
                int step = Math.max(1, Math.max(w, h) / keep);
                ImageReadParam param = reader.getDefaultReadParam();
                param.setSourceSubsampling(step, step, 0, 0);
                return reader.read(0, param);
            } finally {
                reader.dispose();
            }
        }
    }

    private BufferedImage resize(BufferedImage src, int targetSize) {
        int w = src.getWidth();
        int h = src.getHeight();
        double scale = Math.min(1.0, (double) targetSize / Math.max(w, h));
        int tw = Math.max(1, (int) Math.round(w * scale));
        int th = Math.max(1, (int) Math.round(h * scale));

        BufferedImage out = new BufferedImage(tw, th, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, tw, th);
            g.drawImage(src, 0, 0, tw, th, null);
        } finally {
            g.dispose();
        }
        return out;
    }

    private int readExifOrientation(Path file) {
        try {
            Metadata metadata = ImageMetadataReader.readMetadata(file.toFile());
            ExifIFD0Directory dir = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
            if (dir != null && dir.containsTag(ExifIFD0Directory.TAG_ORIENTATION)) {
                return dir.getInt(ExifIFD0Directory.TAG_ORIENTATION);
            }
        } catch (Exception e) {
            log.debug("Nu s-a putut citi orientarea EXIF: {}", e.getMessage());
        }
        return 1;
    }

    /** Aplica rotirea/oglindirea indicata de tag-ul EXIF Orientation (1-8). */
    private BufferedImage applyOrientation(BufferedImage img, int orientation) {
        if (orientation <= 1 || orientation > 8) return img;
        int w = img.getWidth();
        int h = img.getHeight();
        boolean swap = orientation >= 5;
        AffineTransform t = new AffineTransform();
        switch (orientation) {
            case 2 -> { t.translate(w, 0); t.scale(-1, 1); }
            case 3 -> { t.translate(w, h); t.rotate(Math.PI); }
            case 4 -> { t.translate(0, h); t.scale(1, -1); }
            case 5 -> { t.rotate(Math.PI / 2); t.scale(1, -1); }
            case 6 -> { t.translate(h, 0); t.rotate(Math.PI / 2); }
            case 7 -> { t.scale(-1, 1); t.translate(-h, 0); t.translate(0, w); t.rotate(-Math.PI / 2); }
            case 8 -> { t.translate(0, w); t.rotate(-Math.PI / 2); }
            default -> { return img; }
        }
        BufferedImage out = new BufferedImage(swap ? h : w, swap ? w : h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.drawImage(img, t, null);
        } finally {
            g.dispose();
        }
        return out;
    }

    private void writeJpeg(BufferedImage img, Path target, float quality) throws IOException {
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpg").next();
        try (OutputStream os = Files.newOutputStream(target);
             ImageOutputStream ios = ImageIO.createImageOutputStream(os)) {
            writer.setOutput(ios);
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(quality);
            param.setProgressiveMode(ImageWriteParam.MODE_DEFAULT);
            writer.write(null, new IIOImage(img, null, null), param);
        } finally {
            writer.dispose();
        }
    }

    /** Thumbnail-ul generat de Google, descarcat cu autentificarea contului de serviciu. */
    private void downloadDriveThumbnail(String fileId, Path target, int size) throws IOException {
        File meta = driveService.files().get(fileId).setFields("thumbnailLink").execute();
        String link = meta.getThumbnailLink();
        if (link == null || link.isBlank()) {
            throw new IOException("Formatul imaginii nu este suportat si Google nu ofera thumbnail pentru " + fileId);
        }
        link = link.replaceAll("=s\\d+$", "=s" + size);
        HttpResponse response = driveService.getRequestFactory()
                .buildGetRequest(new GenericUrl(link))
                .execute();
        try (InputStream in = response.getContent()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        } finally {
            response.disconnect();
        }
    }

    private Path cachePath(String fileId, Variant variant) {
        Path p = cacheDir.resolve(fileId + variant.suffix + ".jpg").normalize();
        if (!p.startsWith(cacheDir)) {
            throw new IllegalArgumentException("ID de fisier invalid");
        }
        return p;
    }

    private void requireValidId(String fileId) {
        if (!isValidFileId(fileId)) {
            throw new IllegalArgumentException("ID de fisier invalid");
        }
    }

    private void checkAvailability() throws IOException {
        if (!isAvailable()) {
            throw new IOException("Google Drive Service nu este configurat. Adauga GOOGLE_CREDENTIALS_JSON sau fisierul de credentiale.");
        }
    }
}
