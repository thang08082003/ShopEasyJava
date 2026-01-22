package com.example.demo.dto;

import com.example.demo.domain.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
    private final String token;
    private final Long userId;
    private final String name;
    private final String email;
    private final Role role;
}
