package com.example.demo.domain;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum OrderStatus {
    PENDING,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    @JsonCreator
    public static OrderStatus from(String value) {
        if (value == null) {
            return null;
        }
        return OrderStatus.valueOf(value.trim().toUpperCase());
    }
}
