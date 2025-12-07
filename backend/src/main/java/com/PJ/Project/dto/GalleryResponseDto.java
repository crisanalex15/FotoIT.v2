package com.PJ.Project.dto;

import com.PJ.Project.entity.EventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GalleryResponseDto {
    private String code;
    private EventType eventType;
    private String name;
    private String description;
    private List<PhotoDto> photos;
    private int totalPhotos;
}

