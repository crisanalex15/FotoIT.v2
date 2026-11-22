package com.PJ.Project.exception;

import com.google.api.client.http.HttpResponseException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        return body(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFound(NoResourceFoundException ex) {
        return body(HttpStatus.NOT_FOUND, "Resursa nu a fost gasita.");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
        return body(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /** Eroare primita de la Google Drive (ex: fisier sters din Drive dupa sincronizare). */
    @ExceptionHandler(HttpResponseException.class)
    public ResponseEntity<Map<String, Object>> handleDriveError(HttpResponseException ex) {
        if (ex.getStatusCode() == 404) {
            return body(HttpStatus.NOT_FOUND, "Fotografia nu mai exista in Google Drive.");
        }
        log.error("Eroare Google Drive ({}): {}", ex.getStatusCode(), ex.getStatusMessage());
        return body(HttpStatus.BAD_GATEWAY, "Google Drive nu a raspuns corect. Incearca din nou.");
    }

    /** Clientul a inchis conexiunea in timpul unui transfer (ex: a inchis tab-ul). Nu e o eroare reala. */
    @ExceptionHandler(AsyncRequestNotUsableException.class)
    public void handleClientAbort(AsyncRequestNotUsableException ex) {
        log.debug("Conexiune inchisa de client: {}", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        // Detaliile raman doar in log, nu se trimit clientului
        log.error("Eroare neasteptata", ex);
        return body(HttpStatus.INTERNAL_SERVER_ERROR, "A aparut o eroare interna. Incearca din nou.");
    }

    private ResponseEntity<Map<String, Object>> body(HttpStatus status, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        response.put("status", status.value());
        return new ResponseEntity<>(response, status);
    }
}
