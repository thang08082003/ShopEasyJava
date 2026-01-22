package com.example.demo.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.domain.Category;
import com.example.demo.domain.Coupon;
import com.example.demo.domain.Product;
import com.example.demo.dto.CouponRequest;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.CouponRepository;
import com.example.demo.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<Coupon> getAll() {
        return couponRepository.findAll();
    }

    public Coupon create(CouponRequest request) {
        couponRepository.findByCodeIgnoreCase(request.getCode()).ifPresent(c -> {
            throw new BadRequestException("Coupon code already exists");
        });
        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountAmount(request.getDiscountAmount())
                .minPurchase(request.getMinPurchase())
                .maxDiscount(request.getMaxDiscount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .usageLimit(request.getUsageLimit())
                .build();

        attachRelations(coupon, request.getCategoryIds(), request.getProductIds());
        return couponRepository.save(coupon);
    }

    @Transactional
    public BigDecimal applyCouponIfPresent(String code, BigDecimal subtotal) {
        if (code == null || code.isBlank()) {
            return BigDecimal.ZERO;
        }
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new BadRequestException("Invalid coupon"));
        if (!coupon.isValid(subtotal)) {
            throw new BadRequestException("Coupon is not valid for this order");
        }
        BigDecimal discount = coupon.calculateDiscount(subtotal);
        coupon.setUsageCount(coupon.getUsageCount() + 1);
        couponRepository.save(coupon);
        return discount;
    }

    private void attachRelations(Coupon coupon, Set<Long> categoryIds, Set<Long> productIds) {
        if (categoryIds != null && !categoryIds.isEmpty()) {
            categoryIds.forEach(id -> {
                Category category = categoryRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
                coupon.getAppliedCategories().add(category);
            });
        }
        if (productIds != null && !productIds.isEmpty()) {
            productIds.forEach(id -> {
                Product product = productRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
                coupon.getAppliedProducts().add(product);
            });
        }
    }
}
