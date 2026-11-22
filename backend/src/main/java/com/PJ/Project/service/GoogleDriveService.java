package com.PJ.Project.service;

import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class GoogleDriveService {

    private final Drive driveService;
    private final Path cacheDir = Paths.get("cache", "thumbnails");

    public GoogleDriveService(@Autowired(required = false) Drive driveService) {
        this.driveService = driveService;
        try {
            Files.createDirectories(cacheDir);
        } catch (IOException e) {
            log.warn("Nu s-a putut crea directorul de cache: {}", cacheDir.toAbsolutePath(), e);
        }
    }

    public boolean isAvailable() {
        return driveService != null;
    }

    /**
     * Listeaza recursiv toate imaginile dintr-un folder Google Drive
     */
    public List<File> listFilesInFolderRecursive(String folderId) throws IOException {
        checkAvailability();
        log.info("Listare recursiva fisiere din folder: {}", folderId);
        List<File> allImages = new ArrayList<>();
        listFilesRecursive(folderId, allImages);
        log.info("Total imagini gasite (recursiv): {}", allImages.size());
        return allImages;
    }

    private void listFilesRecursive(String folderId, List<File> allImages) throws IOException {
        String pageToken = null;
        List<String> imageMimeTypes = List.of(
                "image/jpeg", "image/png", "image/gif", "image/webp",
                "image/bmp", "image/tiff", "image/svg+xml"
        );

        do {
            String query = String.format("'%s' in parents and trashed=false", folderId);
            FileList result = driveService.files().list()
                    .setQ(query)
                    .setFields("nextPageToken, files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink)")
                    .setPageToken(pageToken)
                    .execute();

            List<File> items = result.getFiles();
            if (items != null) {
                for (File item : items) {
                    String mimeType = item.getMimeType();
                    if (mimeType != null) {
                        if (mimeType.equals("application/vnd.google-apps.folder")) {
                            listFilesRecursive(item.getId(), allImages);
                        } else if (imageMimeTypes.stream().anyMatch(mimeType::startsWith)) {
                            allImages.add(item);
                        }
                    }
                }
            }
            pageToken = result.getNextPageToken();
        } while (pageToken != null);
    }

    /**
     * Obtine stream-ul direct al unui fisier din Google Drive (fara a incarca tot fisierul in RAM)
     */
    public InputStream getFileStream(String fileId) throws IOException {
        checkAvailability();
        return driveService.files().get(fileId)
                .executeMediaAsInputStream();
    }

    /**
     * Obtine thumbnail optimizat (cu cache pe disc).
     * Daca thumbnail-ul nu exista in cache, il genereaza redimensionat (max 600px latime)
     * reducand un fisier de 20MB la ~40-60KB.
     */
    public InputStream getOptimizedThumbnailStream(String fileId) throws IOException {
        checkAvailability();
        Path cachedFile = cacheDir.resolve(fileId + ".jpg");

        if (Files.exists(cachedFile)) {
            return Files.newInputStream(cachedFile);
        }

        // Genereaza thumbnail si il salveaza in cache
        try (InputStream originalStream = getFileStream(fileId)) {
            BufferedImage originalImage = ImageIO.read(originalStream);
            if (originalImage != null) {
                int originalWidth = originalImage.getWidth();
                int originalHeight = originalImage.getHeight();
                int targetWidth = Math.min(originalWidth, 600);
                int targetHeight = (int) Math.round((double) originalHeight * targetWidth / originalWidth);

                BufferedImage thumbnail = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
                Graphics2D g2d = thumbnail.createGraphics();
                g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
                g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                g2d.drawImage(originalImage, 0, 0, targetWidth, targetHeight, Color.WHITE, null);
                g2d.dispose();

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(thumbnail, "jpg", baos);
                byte[] thumbnailBytes = baos.toByteArray();

                try {
                    Files.write(cachedFile, thumbnailBytes);
                } catch (Exception ex) {
                    log.warn("Nu s-a putut scrie in cache pentru fileId {}: {}", fileId, ex.getMessage());
                }

                return new ByteArrayInputStream(thumbnailBytes);
            }
        } catch (Exception e) {
            log.warn("Generarea de thumbnail redimensionat a esuat pentru {}, se foloseste stream-ul original: {}", fileId, e.getMessage());
        }

        // Fallback daca ImageIO nu recunoaste formatul
        return getFileStream(fileId);
    }

    /**
     * Obtine numele unui fisier din Google Drive
     */
    public String getFileName(String fileId) {
        if (!isAvailable()) return null;
        try {
            File file = driveService.files().get(fileId)
                    .setFields("name")
                    .execute();
            return file.getName();
        } catch (Exception e) {
            log.warn("Nu s-a putut obtine numele fisierului {}: {}", fileId, e.getMessage());
            return null;
        }
    }

    /**
     * Obtine URL-ul thumbnail-ului CDN Google daca e disponibil
     */
    public String getThumbnailLink(String fileId) {
        if (!isAvailable()) return null;
        try {
            File file = driveService.files().get(fileId)
                    .setFields("thumbnailLink")
                    .execute();
            String link = file.getThumbnailLink();
            if (link != null && link.contains("=s220")) {
                return link.replace("=s220", "=s600");
            }
            return link;
        } catch (Exception e) {
            log.warn("Nu s-a putut obtine thumbnailLink pentru {}: {}", fileId, e.getMessage());
            return null;
        }
    }

    private void checkAvailability() throws IOException {
        if (!isAvailable()) {
            throw new IOException("Google Drive Service nu este configurat. Adauga GOOGLE_CREDENTIALS_JSON sau fisierul de credentiale.");
        }
    }
}
