package com.example.demo.dto;

import com.example.demo.domain.OrderStatus;
import com.example.demo.domain.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderRequest {
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
}
