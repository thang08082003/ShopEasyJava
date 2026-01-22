package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.domain.Category;
import com.example.demo.domain.Product;
import com.example.demo.dto.ProductRequest;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    public List<Product> search(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    public List<Product> byCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return productRepository.findByCategory(category);
    }

    public Product create(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
            .salePrice(request.getSalePrice() != null ? request.getSalePrice() : productSaleDefault())
                .category(category)
            .stock(request.getStock() != null ? request.getStock() : 0)
                .images(request.getImages() != null ? request.getImages() : List.of())
                .specifications(request.getSpecifications())
                .build();
        return productRepository.save(product);
    }

    public Product update(Long id, ProductRequest request) {
        Product product = getById(id);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setSalePrice(request.getSalePrice() != null ? request.getSalePrice() : productSaleDefault());
        product.setCategory(category);
        product.setStock(request.getStock() != null ? request.getStock() : product.getStock());
        if (request.getImages() != null) {
            product.setImages(request.getImages());
        }
        product.setSpecifications(request.getSpecifications());
        return productRepository.save(product);
    }

    public void delete(Long id) {
        Product product = getById(id);
        productRepository.delete(product);
    }

    private java.math.BigDecimal productSaleDefault() {
        return java.math.BigDecimal.ZERO;
    }
}
