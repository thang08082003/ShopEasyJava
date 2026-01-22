package com.example.demo.domain;

public enum DiscountType {
    PERCENTAGE,
    FIXED;

    public static DiscountType from(String value) {
        if (value == null) return null;
        return DiscountType.valueOf(value.trim().toUpperCase());
    }
}
