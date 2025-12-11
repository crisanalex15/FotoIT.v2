package com.PJ.Project.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.util.Collections;

@Configuration
@Slf4j
public class GoogleDriveConfig {

    @Bean
    @ConditionalOnProperty(name = "google.drive.credentials.path")
    public Drive driveService(@Value("${google.drive.credentials.path}") Resource credentialsResource) throws IOException {
        log.info("Initializare Google Drive Service...");
        
        if (!credentialsResource.exists()) {
            log.warn("Fisierul de credentiale Google Drive nu exista: {}. Google Drive Service nu va fi disponibil.", 
                    credentialsResource.getFilename());
            throw new IOException("Fisierul de credentiale Google Drive nu exista: " + credentialsResource.getFilename());
        }
        
        GoogleCredential credential = GoogleCredential
                .fromStream(credentialsResource.getInputStream())
                .createScoped(Collections.singleton(DriveScopes.DRIVE_READONLY));

        return new Drive.Builder(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance(),
                credential)
                .setApplicationName("FotoIT")
                .build();
    }
}

