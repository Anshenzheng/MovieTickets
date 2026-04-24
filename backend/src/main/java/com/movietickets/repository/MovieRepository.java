package com.movietickets.repository;

import com.movietickets.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    List<Movie> findByStatusOrderByCreatedAtDesc(Movie.MovieStatus status);

    List<Movie> findByStatusInOrderByCreatedAtDesc(List<Movie.MovieStatus> statuses);

    @Query("SELECT m FROM Movie m WHERE m.status = 'SHOWING' ORDER BY m.rating DESC")
    List<Movie> findShowingMoviesOrderByRating();

    List<Movie> findByTitleContainingIgnoreCase(String title);
}
