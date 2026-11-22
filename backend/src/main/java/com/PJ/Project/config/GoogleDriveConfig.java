package com.PJ.Project.config;

import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

@Configuration
@Slf4j
public class GoogleDriveConfig {

    @Value("${google.drive.credentials.path:classpath:fotoit-gallery-credentials.json}")
    private String credentialsPath;

    @Bean
    public Drive driveService(ResourceLoader resourceLoader) {
        log.info("Verificare si initializare Google Drive Service...");

        try (InputStream inputStream = resolveCredentialsInputStream(resourceLoader)) {
            if (inputStream == null) {
                log.warn("⚠️ Google Drive: Nu s-au gasit credentiale valide. Google Drive sync va fi dezactivat pana la furnizarea fisierului sau a variabilei GOOGLE_CREDENTIALS_JSON.");
                return null;
            }

            GoogleCredentials credentials = GoogleCredentials.fromStream(inputStream)
                    .createScoped(Collections.singleton(DriveScopes.DRIVE_READONLY));

            HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);

            Drive drive = new Drive.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance(),
                    requestInitializer)
                    .setApplicationName("FotoIT")
                    .build();

            log.info("✅ Google Drive Service initializat cu succes!");
            return drive;
        } catch (Exception e) {
            log.error("❌ Eroare la initializarea Google Drive Service: {}", e.getMessage());
            return null;
        }
    }

    private InputStream resolveCredentialsInputStream(ResourceLoader resourceLoader) {
        // 1. Variabila de mediu cu continutul JSON direct (recomandat pentru cloud/Docker)
        String envJson = System.getenv("GOOGLE_CREDENTIALS_JSON");
        if (envJson != null && !envJson.isBlank()) {
            log.info("Incarcare credentiale Google Drive din variabila GOOGLE_CREDENTIALS_JSON");
            return new ByteArrayInputStream(envJson.getBytes(StandardCharsets.UTF_8));
        }

        // 2. Variabila de mediu standard GOOGLE_APPLICATION_CREDENTIALS (cale fisier)
        String envPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (envPath != null && !envPath.isBlank()) {
            File envFile = new File(envPath);
            if (envFile.exists() && envFile.isFile()) {
                try {
                    log.info("Incarcare credentiale din fisierul indicat de GOOGLE_APPLICATION_CREDENTIALS: {}", envPath);
                    return new FileInputStream(envFile);
                } catch (Exception e) {
                    log.warn("Nu s-a putut citi fisierul {}: {}", envPath, e.getMessage());
                }
            }
        }

        // 3. Calea specificata in application.properties (classpath sau file:)
        List<String> resourceCandidates = List.of(
                credentialsPath,
                credentialsPath + ".json",
                "classpath:fotoit-gallery-credentials.json",
                "classpath:fotoit-gallery-credentials.json.json"
        );
        for (String candidate : resourceCandidates) {
            try {
                Resource resource = resourceLoader.getResource(candidate);
                if (resource.exists()) {
                    log.info("Incarcare credentiale din resursa: {}", candidate);
                    return resource.getInputStream();
                }
            } catch (Exception ignored) {
            }
        }

        // 4. Fisiere directe pe disc (locatii relative frecvente in dev si prod)
        List<String> fileCandidates = List.of(
                "fotoit-gallery-credentials.json",
                "fotoit-gallery-credentials.json.json",
                "src/main/resources/fotoit-gallery-credentials.json",
                "src/main/resources/fotoit-gallery-credentials.json.json",
                "backend/src/main/resources/fotoit-gallery-credentials.json",
                "backend/src/main/resources/fotoit-gallery-credentials.json.json"
        );
        for (String filePath : fileCandidates) {
            File file = new File(filePath);
            if (file.exists() && file.isFile()) {
                try {
                    log.info("Incarcare credentiale din fisierul de pe disc: {}", filePath);
                    return new FileInputStream(file);
                } catch (Exception e) {
                    log.warn("Eroare la citirea fisierului {}: {}", filePath, e.getMessage());
                }
            }
        }

        return null;
    }
}
