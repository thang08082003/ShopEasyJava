package com.example.demo.service;

import java.math.BigDecimal;
import java.util.Iterator;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.Cart;
import com.example.demo.domain.CartItem;
import com.example.demo.domain.Product;
import com.example.demo.domain.User;
import com.example.demo.domain.Coupon;
import com.example.demo.dto.AddCartItemRequest;
import com.example.demo.dto.ApplyCouponRequest;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.BadRequestException;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.CouponRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;

    @Transactional
    public Cart addItem(User user, AddCartItemRequest request) {
        Cart cart = getOrCreateCart(user);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        CartItem existing = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElse(null);

        if (existing == null) {
            cart.getItems().add(CartItem.builder()
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getSalePrice() != null && product.getSalePrice().doubleValue() > 0
                            ? product.getSalePrice()
                            : product.getPrice())
                    .build());
        } else {
            existing.setQuantity(existing.getQuantity() + request.getQuantity());
        }

        recalculate(cart);
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItem(User user, Long productId) {
        Cart cart = getOrCreateCart(user);
        Iterator<CartItem> iterator = cart.getItems().iterator();
        while (iterator.hasNext()) {
            CartItem item = iterator.next();
            if (item.getProduct().getId().equals(productId)) {
                iterator.remove();
            }
        }
        recalculate(cart);
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart getCart(User user) {
        return getOrCreateCart(user);
    }

    @Transactional
    public void clear(User user) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        recalculate(cart);
        cartRepository.save(cart);
    }

    @Transactional
    public Cart applyCoupon(User user, ApplyCouponRequest request) {
        Cart cart = getOrCreateCart(user);
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(request.getCode())
                .orElseThrow(() -> new BadRequestException("Invalid coupon code"));

        if (!coupon.isValid(cart.getTotalAmount())) {
            throw new BadRequestException("Coupon is expired or invalid for this order");
        }

        cart.setCouponCode(coupon.getCode());
        cart.setDiscountAmount(coupon.calculateDiscount(cart.getTotalAmount()));
        recalculate(cart);

        // increment usage if limit is set
        if (coupon.getUsageLimit() != null) {
            coupon.setUsageCount(coupon.getUsageCount() + 1);
            couponRepository.save(coupon);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeCoupon(User user) {
        Cart cart = getOrCreateCart(user);
        cart.setCouponCode(null);
        cart.setDiscountAmount(null);
        recalculate(cart);
        return cartRepository.save(cart);
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    private void recalculate(Cart cart) {
        BigDecimal total = cart.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cart.setTotalAmount(total);
        if (cart.getDiscountAmount() != null) {
            cart.setDiscountedAmount(total.subtract(cart.getDiscountAmount()));
        } else {
            cart.setDiscountedAmount(total);
        }
    }
}
