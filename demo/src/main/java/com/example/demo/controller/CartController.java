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

import com.example.demo.domain.Cart;
import com.example.demo.domain.User;
import com.example.demo.dto.AddCartItemRequest;
import com.example.demo.service.AuthService;
import com.example.demo.service.CartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.getCart(user));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItem(@RequestBody @Validated AddCartItemRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.addItem(user, request));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Cart> removeItem(@PathVariable Long productId) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.removeItem(user, productId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clear() {
        User user = authService.getCurrentUser();
        cartService.clear(user);
        return ResponseEntity.noContent().build();
    }
}
