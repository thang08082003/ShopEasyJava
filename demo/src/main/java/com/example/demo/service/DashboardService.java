package com.example.demo.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.domain.Order;
import com.example.demo.domain.OrderStatus;
import com.example.demo.domain.PaymentStatus;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public Map<String, Object> summary() {
        Map<String, Object> metrics = new HashMap<>();

        // Basic counts
        metrics.put("totalUsers", userRepository.count());
        metrics.put("totalProducts", productRepository.count());
        metrics.put("totalOrders", orderRepository.count());

        // Revenue = completed payments
        BigDecimal totalRevenue = orderRepository.findByPaymentStatus(PaymentStatus.COMPLETED).stream()
                .map(order -> order.getGrandTotal() != null ? order.getGrandTotal() : order.getTotalAmount())
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        metrics.put("totalRevenue", totalRevenue);

        // Daily revenue last 7 days
        Instant sevenDaysAgo = Instant.now().minusSeconds(7 * 24 * 3600);
        List<Order> recentPaid = orderRepository.findByCreatedAtAfter(sevenDaysAgo).stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.COMPLETED)
                .toList();

        Map<LocalDate, DailyRow> dailyMap = new HashMap<>();
        for (Order order : recentPaid) {
            LocalDate day = order.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate();
            DailyRow row = dailyMap.computeIfAbsent(day, d -> new DailyRow());
            BigDecimal amount = order.getGrandTotal() != null ? order.getGrandTotal() : order.getTotalAmount();
            if (amount != null) {
                row.revenue = row.revenue.add(amount);
            }
            row.orders += 1;
        }

        List<Map<String, Object>> dailyRevenue = dailyMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("date", e.getKey().toString());
                    row.put("revenue", e.getValue().revenue);
                    row.put("orders", e.getValue().orders);
                    return row;
                })
                .toList();

        // Order status breakdown
        Map<OrderStatus, Long> statusCounts = orderRepository.findAll().stream()
                .collect(Collectors.groupingBy(Order::getOrderStatus, Collectors.counting()));
        List<Map<String, Object>> orderStatusBreakdown = statusCounts.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("status", e.getKey().name().toLowerCase());
                    row.put("count", e.getValue());
                    return row;
                })
                .toList();

        // Recent orders (last 10)
        List<Map<String, Object>> recentOrders = orderRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(o -> {
                    Map<String, Object> row = new HashMap<>();
                    row.put("id", o.getId());
                    row.put("user", o.getUser() != null ? o.getUser().getName() : "Unknown");
                    row.put("email", o.getUser() != null ? o.getUser().getEmail() : "");
                    row.put("grandTotal", o.getGrandTotal());
                    row.put("orderStatus", o.getOrderStatus());
                    row.put("paymentStatus", o.getPaymentStatus());
                    row.put("createdAt", o.getCreatedAt());
                    return row;
                })
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("metrics", metrics);
        response.put("dailyRevenue", dailyRevenue);
        response.put("orderStatusBreakdown", orderStatusBreakdown);
        response.put("recentOrders", recentOrders);
        return response;
    }

    private static class DailyRow {
        BigDecimal revenue = BigDecimal.ZERO;
        int orders = 0;
    }
}