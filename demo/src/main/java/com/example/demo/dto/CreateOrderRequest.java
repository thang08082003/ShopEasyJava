package com.example.demo.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateOrderRequest {
    @NotBlank
    private String street;
    @NotBlank
    private String city;
    @NotBlank
    private String state;
    @NotBlank
    private String zipCode;
    @NotBlank
    private String country;

    @NotBlank
    private String paymentMethod;

    @NotNull
    private BigDecimal shippingFee;

    @NotNull
    private BigDecimal tax;

    private String couponCode;
}
