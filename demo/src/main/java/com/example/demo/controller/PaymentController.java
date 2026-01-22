package com.example.demo.controller;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @PostMapping("/intent")
    public ResponseEntity<Map<String, Object>> createIntent(@RequestBody PaymentIntentRequest request) {
        // Placeholder for integrating with Stripe/another PSP later.
        return ResponseEntity.ok(Map.of(
                "clientSecret", "demo-secret",
                "amount", request.getAmount(),
                "currency", request.getCurrency()
        ));
    }

    @Getter
    @Setter
    public static class PaymentIntentRequest {
        @NotNull
        private BigDecimal amount;
        private String currency = "usd";
    }
}
