package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import com.example.demo.domain.DiscountType;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CouponRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String description;

    @NotNull
    private DiscountType discountType;

    @JsonCreator
    public void setDiscountType(String value) {
        this.discountType = DiscountType.from(value);
    }

    @JsonValue
    public DiscountType getDiscountType() {
        return discountType;
    }

    @NotNull
    private BigDecimal discountAmount;

    private BigDecimal minPurchase;
    private BigDecimal maxDiscount;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    @Future
    private LocalDateTime endDate;

    private Integer usageLimit;

    private Set<Long> categoryIds;
    private Set<Long> productIds;
}
