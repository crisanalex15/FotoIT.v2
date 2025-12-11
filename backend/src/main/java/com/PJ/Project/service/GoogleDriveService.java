package com.PJ.Project.service;

import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@ConditionalOnBean(Drive.class)
@RequiredArgsConstructor
public class GoogleDriveService {

    private final Drive driveService;

    // pentru a obtine toate imaginile din folderul Google Drive
    public List<File> listFilesInFolderRecursive(String folderId) throws IOException {
        log.info("Listare recursiva fisiere din folder: {}", folderId);
        List<File> allImages = new ArrayList<>();
        listFilesRecursive(folderId, allImages);
        log.info("Total imagini gasite (recursiv): {}", allImages.size());
        return allImages;
    }

    // pentru a obtine toate imaginile din folderul Google Drive recursiv
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

    // pentru a obtine URL-ul de vizualizare a imaginii
    public String getFileViewUrl(String fileId, String webContentLink) {
        if (webContentLink != null && !webContentLink.isEmpty()) {
            return webContentLink;
        }
        return String.format("https://drive.google.com/uc?export=view&id=%s", fileId);
    }

    public String getThumbnailUrl(String fileId) {
        // Pentru fisiere private, folosim URL-ul cu export=view si parametru sz pentru dimensiune
        // Acest URL functioneaza mai bine pentru fisiere private decat thumbnail standard
        return String.format("https://drive.google.com/uc?export=view&id=%s&sz=w400", fileId);
    }

    /**
     * Obtine URL-ul thumbnail-ului pentru un fisier
     * @param fileId ID-ul fisierului
     * @return URL-ul thumbnail-ului sau null daca nu exista
     */
    public String getThumbnailLink(String fileId) throws IOException {
        try {
            com.google.api.services.drive.model.File file = driveService.files().get(fileId)
                    .setFields("thumbnailLink")
                    .execute();
            return file.getThumbnailLink();
        } catch (Exception e) {
            log.warn("Nu s-a putut obtine thumbnail link pentru fisierul {}", fileId, e);
            return null;
        }
    }
    
    /**
     * Descarca continutul unui fisier din Google Drive (pentru proxy)
     * @param fileId ID-ul fisierului
     * @return Byte array cu continutul fisierului
     * @throws IOException daca apare o eroare la descarcare
     */
    public byte[] downloadFile(String fileId) throws IOException {
        try {
            return driveService.files().get(fileId)
                    .executeMediaAsInputStream()
                    .readAllBytes();
        } catch (Exception e) {
            log.error("Eroare la descarcarea fisierului {}", fileId, e);
            throw new IOException("Nu s-a putut descarca fisierul: " + fileId, e);
        }
    }

    /**
     * Obtine numele unui fisier din Google Drive
     * @param fileId ID-ul fisierului
     * @return Numele fisierului sau null daca apare o eroare
     */
    public String getFileName(String fileId) {
        try {
            com.google.api.services.drive.model.File file = driveService.files().get(fileId)
                    .setFields("name")
                    .execute();
            return file.getName();
        } catch (Exception e) {
            log.warn("Nu s-a putut obtine numele fisierului {}", fileId, e);
            return null;
        }
    }
}

