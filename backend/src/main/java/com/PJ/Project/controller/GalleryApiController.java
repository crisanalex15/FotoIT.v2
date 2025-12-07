package com.PJ.Project.controller;

import com.PJ.Project.dto.GalleryResponseDto;
import com.PJ.Project.service.WeddingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GalleryApiController {

    private final WeddingService weddingService;

    @GetMapping("/{code}")
    public ResponseEntity<GalleryResponseDto> getGallery(@PathVariable String code) {
        GalleryResponseDto gallery = weddingService.getGalleryByCode(code);
        return ResponseEntity.ok(gallery);
    }
}

