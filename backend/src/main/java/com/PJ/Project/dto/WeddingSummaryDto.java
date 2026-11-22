package com.PJ.Project.dto;

import com.PJ.Project.entity.EventType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeddingSummaryDto {
    private Long id;
    private String code;
    private EventType eventType;
    private String name;
    private String description;
    private long photoCount;
    private String googleFolderId;
    private LocalDateTime createdAt;
    private LocalDateTime lastSyncedAt;
}

