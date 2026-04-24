package com.movietickets.controller;

import com.movietickets.dto.ApiResponse;
import com.movietickets.dto.JwtResponse;
import com.movietickets.dto.LoginRequest;
import com.movietickets.dto.RegisterRequest;
import com.movietickets.entity.User;
import com.movietickets.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.register(request);
            return ResponseEntity.ok(ApiResponse.success("注册成功", user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            JwtResponse jwtResponse = userService.login(request);
            return ResponseEntity.ok(ApiResponse.success("登录成功", jwtResponse));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("用户名或密码错误"));
        }
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<User>> getCurrentUser() {
        User user = userService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("用户未登录"));
        }
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
