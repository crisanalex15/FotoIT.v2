package com.PJ.Project.dto;

import com.PJ.Project.entity.EventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeddingDto {
    private String googleFolderId;
    private EventType eventType;
    private String name;
    private String description;
}

