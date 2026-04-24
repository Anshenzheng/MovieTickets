package com.movietickets.service;

import com.movietickets.entity.Movie;
import com.movietickets.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public List<Movie> getShowingMovies() {
        return movieRepository.findByStatusOrderByCreatedAtDesc(Movie.MovieStatus.SHOWING);
    }

    public List<Movie> getComingSoonMovies() {
        return movieRepository.findByStatusOrderByCreatedAtDesc(Movie.MovieStatus.COMING_SOON);
    }

    public List<Movie> getActiveMovies() {
        return movieRepository.findByStatusInOrderByCreatedAtDesc(
                Arrays.asList(Movie.MovieStatus.COMING_SOON, Movie.MovieStatus.SHOWING)
        );
    }

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("电影不存在"));
    }

    public List<Movie> searchMovies(String keyword) {
        return movieRepository.findByTitleContainingIgnoreCase(keyword);
    }

    @Transactional
    public Movie createMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    @Transactional
    public Movie updateMovie(Long id, Movie movieDetails) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("电影不存在"));

        movie.setTitle(movieDetails.getTitle());
        movie.setOriginalTitle(movieDetails.getOriginalTitle());
        movie.setDirector(movieDetails.getDirector());
        movie.setActors(movieDetails.getActors());
        movie.setGenre(movieDetails.getGenre());
        movie.setDuration(movieDetails.getDuration());
        movie.setReleaseDate(movieDetails.getReleaseDate());
        movie.setDescription(movieDetails.getDescription());
        movie.setPosterUrl(movieDetails.getPosterUrl());
        movie.setRating(movieDetails.getRating());
        movie.setStatus(movieDetails.getStatus());

        return movieRepository.save(movie);
    }

    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("电影不存在"));
        movieRepository.delete(movie);
    }
}
