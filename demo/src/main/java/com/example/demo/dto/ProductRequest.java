package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    private String description;

    @NotNull
    @Min(0)
    private BigDecimal price;

    @Min(0)
    private BigDecimal salePrice;

    @NotNull
    private Long categoryId;

    private Integer stock;

    private String specifications;

    private List<String> images;
}
