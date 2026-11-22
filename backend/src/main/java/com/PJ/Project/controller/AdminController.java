package com.PJ.Project.controller;

import com.PJ.Project.dto.WeddingDto;
import com.PJ.Project.dto.WeddingSummaryDto;
import com.PJ.Project.entity.EventType;
import com.PJ.Project.entity.Wedding;
import com.PJ.Project.service.GoogleDriveService;
import com.PJ.Project.service.WeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final WeddingService weddingService;
    private final GoogleDriveService googleDriveService;

    /** Adresa publica a site-ului (Next.js), folosita pentru link-urile trimise clientilor */
    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @ModelAttribute
    void commonAttributes(Model model) {
        model.addAttribute("frontendUrl", currentFrontendUrl());
        model.addAttribute("eventTypes", EventType.values());
        model.addAttribute("driveAvailable", googleDriveService.isAvailable());
    }

    @GetMapping
    public String dashboard(Model model) {
        List<WeddingSummaryDto> weddings = weddingService.getAllWeddingsSummary();
        model.addAttribute("weddings", weddings);
        model.addAttribute("totalPhotos", weddings.stream().mapToLong(WeddingSummaryDto::getPhotoCount).sum());
        model.addAttribute("neverSynced", weddings.stream().filter(w -> w.getLastSyncedAt() == null && w.getPhotoCount() == 0).count());
        return "admin/dashboard";
    }

    @PostMapping("/create")
    public String createWedding(@ModelAttribute WeddingDto weddingDto, RedirectAttributes redirect) {
        try {
            Wedding wedding = weddingService.createWedding(weddingDto);
            redirect.addFlashAttribute("success",
                    "Evenimentul „" + wedding.getName() + "” a fost creat. Cod: " + wedding.getCode()
                            + ". Apasă „Sincronizează” ca să aduci pozele din Drive.");
            return "redirect:/admin/" + wedding.getId();
        } catch (IllegalArgumentException e) {
            redirect.addFlashAttribute("error", e.getMessage());
        } catch (Exception e) {
            log.error("Eroare la crearea evenimentului", e);
            redirect.addFlashAttribute("error", "Evenimentul nu a putut fi creat. Verifică datele și încearcă din nou.");
        }
        return "redirect:/admin";
    }

    @PostMapping("/{id}/sync")
    public String syncPhotos(@PathVariable Long id,
                             @RequestParam(required = false, defaultValue = "") String returnTo,
                             RedirectAttributes redirect) {
        try {
            int count = weddingService.syncPhotosFromGoogleDrive(id);
            redirect.addFlashAttribute("success", count == 0
                    ? "Sincronizare gata, dar folderul nu conține poze. Verifică dacă e partajat cu contul de serviciu."
                    : "Sincronizare reușită: " + count + " poze. Previzualizările se pregătesc în fundal.");
        } catch (Exception e) {
            log.error("Eroare la sincronizare poze pentru evenimentul {}", id, e);
            redirect.addFlashAttribute("error", syncErrorMessage(e));
        }
        return "details".equals(returnTo) ? "redirect:/admin/" + id : "redirect:/admin";
    }

    @PostMapping("/{id}/edit")
    public String editWedding(@PathVariable Long id, @ModelAttribute WeddingDto dto, RedirectAttributes redirect) {
        try {
            weddingService.updateWedding(id, dto);
            redirect.addFlashAttribute("success", "Modificările au fost salvate.");
        } catch (IllegalArgumentException e) {
            redirect.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/" + id;
    }

    @PostMapping("/{id}/delete")
    public String deleteWedding(@PathVariable Long id, RedirectAttributes redirect) {
        try {
            Wedding wedding = weddingService.getWeddingById(id);
            weddingService.deleteWedding(id);
            redirect.addFlashAttribute("success", "Evenimentul „" + wedding.getName() + "” a fost șters.");
        } catch (Exception e) {
            log.error("Eroare la stergere eveniment", e);
            redirect.addFlashAttribute("error", "Evenimentul nu a putut fi șters.");
        }
        return "redirect:/admin";
    }

    @GetMapping("/{id}")
    public String weddingDetails(@PathVariable Long id, Model model) {
        Wedding wedding = weddingService.getWeddingById(id);
        model.addAttribute("wedding", wedding);
        model.addAttribute("photos", weddingService.getPhotosForWedding(id));
        return "admin/wedding-details";
    }

    /**
     * Adresa site-ului pentru link-urile trimise clientilor. Daca ruleaza un tunel public
     * (start-public.bat scrie adresa in public-url.txt), se foloseste aceea; altfel app.frontend-url.
     */
    private String currentFrontendUrl() {
        try {
            Path file = Path.of("public-url.txt");
            if (Files.isRegularFile(file)) {
                String url = Files.readString(file).trim();
                if (url.matches("^https://[A-Za-z0-9.-]+$")) {
                    return url;
                }
            }
        } catch (Exception e) {
            log.debug("public-url.txt nu a putut fi citit: {}", e.getMessage());
        }
        return frontendUrl.replaceAll("/+$", "");
    }

    private static String syncErrorMessage(Exception e) {
        String msg = String.valueOf(e.getMessage());
        if (e instanceof IllegalStateException) {
            return "Google Drive nu este configurat: lipsește fișierul de credențiale.";
        }
        if (msg.contains("404") || msg.contains("notFound") || msg.contains("File not found")) {
            return "Folderul nu a fost găsit în Google Drive. Verifică link-ul și dacă folderul e partajat cu contul de serviciu.";
        }
        if (msg.contains("403")) {
            return "Contul de serviciu nu are acces la folder. Partajează folderul cu adresa contului de serviciu.";
        }
        return "Sincronizarea a eșuat. Încearcă din nou peste câteva momente.";
    }
}
