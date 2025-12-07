package com.PJ.Project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoDto {
    private Long id;
    private String filename;
    private String url;
    private String thumbnailUrl;
    private Long weddingId;
    private String fileId;
    private LocalDateTime createdAt;
}

