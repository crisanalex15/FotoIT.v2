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

    public List<File> listFilesInFolderRecursive(String folderId) throws IOException {
        log.info("Listare recursivă fișiere din folder: {}", folderId);
        List<File> allImages = new ArrayList<>();
        listFilesRecursive(folderId, allImages);
        log.info("Total imagini găsite (recursiv): {}", allImages.size());
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

    public String getFileViewUrl(String fileId, String webContentLink) {
        if (webContentLink != null && !webContentLink.isEmpty()) {
            return webContentLink;
        }
        return String.format("https://drive.google.com/uc?export=view&id=%s", fileId);
    }

    public String getThumbnailUrl(String fileId) {
        return String.format("https://drive.google.com/thumbnail?id=%s&sz=w400", fileId);
    }
}

