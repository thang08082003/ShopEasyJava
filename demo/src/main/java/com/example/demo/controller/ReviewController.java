package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.Review;
import com.example.demo.domain.User;
import com.example.demo.dto.ReviewRequest;
import com.example.demo.service.AuthService;
import com.example.demo.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final AuthService authService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> list(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.forProduct(productId));
    }

    @PostMapping
    public ResponseEntity<Review> add(@RequestBody @Validated ReviewRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(reviewService.addReview(user, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        reviewService.deleteReview(user, id);
        return ResponseEntity.noContent().build();
    }
}
