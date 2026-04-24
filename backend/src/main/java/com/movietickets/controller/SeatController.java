package com.movietickets.controller;

import com.movietickets.dto.ApiResponse;
import com.movietickets.dto.SeatLockRequest;
import com.movietickets.entity.Seat;
import com.movietickets.entity.SeatLock;
import com.movietickets.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @GetMapping("/hall/{hallId}")
    public ResponseEntity<ApiResponse<List<Seat>>> getSeatsByHall(@PathVariable Long hallId) {
        List<Seat> seats = seatService.getSeatsByHall(hallId);
        return ResponseEntity.ok(ApiResponse.success(seats));
    }

    @GetMapping("/screening/{screeningId}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSeatStatus(@PathVariable Long screeningId) {
        Map<String, Object> seatStatus = seatService.getSeatStatusByScreening(screeningId);
        return ResponseEntity.ok(ApiResponse.success(seatStatus));
    }

    @PostMapping("/lock")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<SeatLock>>> lockSeats(@Valid @RequestBody SeatLockRequest request) {
        try {
            List<SeatLock> locks = seatService.lockSeats(request.getScreeningId(), request.getSeatIds());
            return ResponseEntity.ok(ApiResponse.success("座位锁定成功", locks));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/unlock")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> unlockSeats(@Valid @RequestBody SeatLockRequest request) {
        seatService.unlockSeats(request.getScreeningId(), request.getSeatIds());
        return ResponseEntity.ok(ApiResponse.success("座位解锁成功", null));
    }
}
