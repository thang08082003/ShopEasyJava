package com.example.demo.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.domain.Order;
import com.example.demo.domain.PaymentStatus;
import com.example.demo.domain.User;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    List<Order> findByPaymentStatus(PaymentStatus status);
    List<Order> findByCreatedAtAfter(Instant after);
    List<Order> findTop10ByOrderByCreatedAtDesc();
}
