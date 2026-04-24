package com.movietickets.controller;

import com.movietickets.dto.ApiResponse;
import com.movietickets.entity.Movie;
import com.movietickets.entity.Order;
import com.movietickets.entity.Screening;
import com.movietickets.service.MovieService;
import com.movietickets.service.OrderService;
import com.movietickets.service.ScreeningService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final MovieService movieService;
    private final ScreeningService screeningService;
    private final OrderService orderService;

    @GetMapping("/movies")
    public ResponseEntity<ApiResponse<List<Movie>>> getAllMovies() {
        List<Movie> movies = movieService.getAllMovies();
        return ResponseEntity.ok(ApiResponse.success(movies));
    }

    @PostMapping("/movies")
    public ResponseEntity<ApiResponse<Movie>> createMovie(@RequestBody Movie movie) {
        Movie savedMovie = movieService.createMovie(movie);
        return ResponseEntity.ok(ApiResponse.success("电影创建成功", savedMovie));
    }

    @PutMapping("/movies/{id}")
    public ResponseEntity<ApiResponse<Movie>> updateMovie(@PathVariable Long id, @RequestBody Movie movie) {
        try {
            Movie updatedMovie = movieService.updateMovie(id, movie);
            return ResponseEntity.ok(ApiResponse.success("电影更新成功", updatedMovie));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/movies/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.ok(ApiResponse.success("电影删除成功", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/screenings")
    public ResponseEntity<ApiResponse<List<Screening>>> getAllScreenings() {
        List<Screening> screenings = screeningService.getScreeningsByMovie(1L);
        return ResponseEntity.ok(ApiResponse.success(screenings));
    }

    @PostMapping("/screenings")
    public ResponseEntity<ApiResponse<Screening>> createScreening(@RequestBody Screening screening) {
        Screening savedScreening = screeningService.createScreening(screening);
        return ResponseEntity.ok(ApiResponse.success("场次创建成功", savedScreening));
    }

    @PutMapping("/screenings/{id}")
    public ResponseEntity<ApiResponse<Screening>> updateScreening(@PathVariable Long id, @RequestBody Screening screening) {
        try {
            Screening updatedScreening = screeningService.updateScreening(id, screening);
            return ResponseEntity.ok(ApiResponse.success("场次更新成功", updatedScreening));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/screenings/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelScreening(@PathVariable Long id) {
        try {
            screeningService.cancelScreening(id);
            return ResponseEntity.ok(ApiResponse.success("场次已取消", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrders() {
        List<Order> orders = orderService.getMyOrders();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<ApiResponse<List<Order>>> getOrdersByUser(@PathVariable Long userId) {
        List<Order> orders = orderService.getOrdersByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
}
