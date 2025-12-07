package com.PJ.Project.entity;

import lombok.Getter;

@Getter
public enum EventType {
    WEDDING("Nunta"),
    SWEET_16("Majorat"),
    EVENT("Eveniment");

    private final String displayName;

    EventType(String displayName) {
        this.displayName = displayName;
    }
}

