package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.User;
import com.example.demo.domain.Wishlist;
import com.example.demo.dto.WishlistRequest;
import com.example.demo.service.AuthService;
import com.example.demo.service.WishlistService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<Wishlist> get() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(wishlistService.get(user));
    }

    @PostMapping
    public ResponseEntity<Wishlist> add(@RequestBody @Validated WishlistRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(wishlistService.add(user, request));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Wishlist> remove(@PathVariable Long productId) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(wishlistService.remove(user, productId));
    }
}
