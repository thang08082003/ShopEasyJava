package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

import com.example.demo.domain.Order;
import com.example.demo.domain.User;
import com.example.demo.dto.CreateOrderRequest;
import com.example.demo.dto.UpdateOrderRequest;
import com.example.demo.service.AuthService;
import com.example.demo.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<Order> create(@RequestBody @Validated CreateOrderRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(orderService.createOrder(user, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> update(@PathVariable Long id, @RequestBody UpdateOrderRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(orderService.updateOrder(id, request, user));
    }

    @GetMapping
    public ResponseEntity<List<Order>> list() {
        User user = authService.getCurrentUser();
        if (user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.ok(orderService.listAll());
        }
        return ResponseEntity.ok(orderService.listUserOrders(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> get(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }
}
