package com.movietickets.controller;

import com.movietickets.dto.ApiResponse;
import com.movietickets.entity.Screening;
import com.movietickets.service.ScreeningService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/screenings")
@RequiredArgsConstructor
public class ScreeningController {

    private final ScreeningService screeningService;

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ApiResponse<List<Screening>>> getScreeningsByMovie(@PathVariable Long movieId) {
        List<Screening> screenings = screeningService.getScreeningsByMovie(movieId);
        return ResponseEntity.ok(ApiResponse.success(screenings));
    }

    @GetMapping("/movie/{movieId}/dates")
    public ResponseEntity<ApiResponse<List<LocalDate>>> getAvailableDates(@PathVariable Long movieId) {
        List<LocalDate> dates = screeningService.getAvailableDatesByMovie(movieId);
        return ResponseEntity.ok(ApiResponse.success(dates));
    }

    @GetMapping("/movie/{movieId}/date/{date}")
    public ResponseEntity<ApiResponse<List<Screening>>> getScreeningsByMovieAndDate(
            @PathVariable Long movieId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Screening> screenings = screeningService.getScreeningsByMovieAndDate(movieId, date);
        return ResponseEntity.ok(ApiResponse.success(screenings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Screening>> getScreeningById(@PathVariable Long id) {
        try {
            Screening screening = screeningService.getScreeningById(id);
            return ResponseEntity.ok(ApiResponse.success(screening));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
