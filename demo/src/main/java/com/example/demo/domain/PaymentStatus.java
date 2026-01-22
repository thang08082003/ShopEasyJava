package com.example.demo.domain;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PaymentStatus {
    PENDING,
    COMPLETED,
    FAILED,
    REFUNDED;

    @JsonCreator
    public static PaymentStatus from(String value) {
        if (value == null) {
            return null;
        }
        return PaymentStatus.valueOf(value.trim().toUpperCase());
    }
}
