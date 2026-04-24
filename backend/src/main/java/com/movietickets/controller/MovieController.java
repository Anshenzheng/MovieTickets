package com.movietickets.controller;

import com.movietickets.dto.ApiResponse;
import com.movietickets.entity.Movie;
import com.movietickets.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Movie>>> getAllMovies() {
        List<Movie> movies = movieService.getActiveMovies();
        return ResponseEntity.ok(ApiResponse.success(movies));
    }

    @GetMapping("/showing")
    public ResponseEntity<ApiResponse<List<Movie>>> getShowingMovies() {
        List<Movie> movies = movieService.getShowingMovies();
        return ResponseEntity.ok(ApiResponse.success(movies));
    }

    @GetMapping("/coming-soon")
    public ResponseEntity<ApiResponse<List<Movie>>> getComingSoonMovies() {
        List<Movie> movies = movieService.getComingSoonMovies();
        return ResponseEntity.ok(ApiResponse.success(movies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Movie>> getMovieById(@PathVariable Long id) {
        try {
            Movie movie = movieService.getMovieById(id);
            return ResponseEntity.ok(ApiResponse.success(movie));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Movie>>> searchMovies(@RequestParam String keyword) {
        List<Movie> movies = movieService.searchMovies(keyword);
        return ResponseEntity.ok(ApiResponse.success(movies));
    }
}
