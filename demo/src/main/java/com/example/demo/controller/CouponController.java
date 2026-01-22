package com.example.demo.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.Cart;
import com.example.demo.domain.Coupon;
import com.example.demo.domain.User;
import com.example.demo.dto.ApplyCouponRequest;
import com.example.demo.dto.CouponRequest;
import com.example.demo.service.AuthService;
import com.example.demo.service.CartService;
import com.example.demo.service.CouponService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    private final CartService cartService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<Coupon>> list() {
        return ResponseEntity.ok(couponService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Coupon> create(@RequestBody @Validated CouponRequest request) {
        return ResponseEntity.ok(couponService.create(request));
    }

    @PostMapping("/apply")
    public ResponseEntity<Cart> apply(@RequestBody @Validated ApplyCouponRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.applyCoupon(user, request));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Cart> remove() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.removeCoupon(user));
    }

    @GetMapping("/{code}/preview")
    public ResponseEntity<Map<String, Object>> preview(@PathVariable String code, @RequestParam("amount") BigDecimal amount) {
        BigDecimal discount = couponService.applyCouponIfPresent(code, amount);
        return ResponseEntity.ok(Map.of("code", code, "discount", discount));
    }
}
