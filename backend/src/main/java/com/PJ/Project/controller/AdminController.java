package com.PJ.Project.controller;

import com.PJ.Project.dto.WeddingDto;
import com.PJ.Project.entity.Wedding;
import com.PJ.Project.service.WeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final WeddingService weddingService;

    @GetMapping
    public String dashboard(Model model) {
        model.addAttribute("weddings", weddingService.getAllWeddingsSummary());
        return "admin/dashboard";
    }

    @PostMapping("/create")
    public String createWedding(@ModelAttribute WeddingDto weddingDto, RedirectAttributes redirectAttributes) {
        try {
            Wedding wedding = weddingService.createWedding(weddingDto);
            redirectAttributes.addFlashAttribute("success", 
                "Eveniment creat cu succes! Cod: " + wedding.getCode());
        } catch (Exception e) {
            log.error("Eroare la crearea evenimentului", e);
            redirectAttributes.addFlashAttribute("error", "Eroare: " + e.getMessage());
        }
        return "redirect:/admin";
    }

    @PostMapping("/{id}/sync")
    public String syncPhotos(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            int count = weddingService.syncPhotosFromGoogleDrive(id);
            redirectAttributes.addFlashAttribute("success", 
                "Sincronizate " + count + " poze cu succes!");
        } catch (IOException e) {
            log.error("Eroare la sincronizare poze", e);
            redirectAttributes.addFlashAttribute("error", 
                "Eroare la sincronizare: " + e.getMessage());
        }
        return "redirect:/admin";
    }

    @PostMapping("/{id}/delete")
    public String deleteWedding(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            weddingService.deleteWedding(id);
            redirectAttributes.addFlashAttribute("success", "Eveniment șters cu succes!");
        } catch (Exception e) {
            log.error("Eroare la ștergere eveniment", e);
            redirectAttributes.addFlashAttribute("error", "Eroare: " + e.getMessage());
        }
        return "redirect:/admin";
    }

    @GetMapping("/{id}")
    public String weddingDetails(@PathVariable Long id, Model model) {
        Wedding wedding = weddingService.getWeddingById(id);
        model.addAttribute("wedding", wedding);
        return "admin/wedding-details";
    }
}
