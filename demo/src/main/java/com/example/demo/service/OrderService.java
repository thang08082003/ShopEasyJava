package com.example.demo.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.Address;
import com.example.demo.domain.Cart;
import com.example.demo.domain.CartItem;
import com.example.demo.domain.Order;
import com.example.demo.domain.OrderItem;
import com.example.demo.domain.User;
import com.example.demo.dto.CreateOrderRequest;
import com.example.demo.dto.UpdateOrderRequest;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.domain.OrderStatus;
import com.example.demo.domain.PaymentStatus;
import com.example.demo.domain.Role;
import org.springframework.security.access.AccessDeniedException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CouponService couponService;

    @Transactional
    public Order createOrder(User user, CreateOrderRequest request) {
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal subtotal = cart.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discount = couponService.applyCouponIfPresent(request.getCouponCode(), subtotal);
        BigDecimal grandTotal = subtotal.add(request.getShippingFee()).add(request.getTax()).subtract(discount);

        Order order = Order.builder()
                .user(user)
                .shippingAddress(buildAddress(request))
                .paymentMethod(request.getPaymentMethod())
                .shippingFee(request.getShippingFee())
                .tax(request.getTax())
                .discountAmount(discount.compareTo(BigDecimal.ZERO) > 0 ? discount : null)
                .couponCode(request.getCouponCode())
                .totalAmount(subtotal)
                .grandTotal(grandTotal)
                .build();

        for (CartItem item : cart.getItems()) {
            order.getItems().add(OrderItem.builder()
                    .product(item.getProduct())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .build());
        }

        Order saved = orderRepository.save(order);
        cart.getItems().clear();
        cartRepository.save(cart);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Order> listUserOrders(User user) {
        return orderRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public List<Order> listAll() {
        return orderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    private Address buildAddress(CreateOrderRequest request) {
        Address address = new Address();
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZipCode(request.getZipCode());
        address.setCountry(request.getCountry());
        return address;
    }

    @Transactional
    public Order updateOrder(Long id, UpdateOrderRequest request, User actor) {
        if (actor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can update orders");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        OrderStatus newOrderStatus = request.getOrderStatus();
        PaymentStatus newPaymentStatus = request.getPaymentStatus();

        if (newOrderStatus != null) {
            order.setOrderStatus(newOrderStatus);
        }

        if (newPaymentStatus != null) {
            order.setPaymentStatus(newPaymentStatus);
        }

        return orderRepository.save(order);
    }
}
