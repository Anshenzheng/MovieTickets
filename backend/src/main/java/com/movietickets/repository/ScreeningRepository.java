package com.movietickets.repository;

import com.movietickets.entity.Screening;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScreeningRepository extends JpaRepository<Screening, Long> {

    List<Screening> findByMovieIdAndStatusOrderByStartTime(Long movieId, Screening.ScreeningStatus status);

    List<Screening> findByMovieIdAndStatusAndStartTimeAfterOrderByStartTime(
            Long movieId, Screening.ScreeningStatus status, LocalDateTime startTime);

    @Query("SELECT s FROM Screening s WHERE s.movieId = :movieId AND s.status = 'ACTIVE' " +
           "AND DATE(s.startTime) = :date ORDER BY s.startTime")
    List<Screening> findByMovieIdAndDate(Long movieId, LocalDate date);

    List<Screening> findByHallIdAndStatus(Long hallId, Screening.ScreeningStatus status);

    @Query("SELECT DISTINCT DATE(s.startTime) FROM Screening s WHERE s.movieId = :movieId " +
           "AND s.status = 'ACTIVE' AND s.startTime >= :now ORDER BY DATE(s.startTime)")
    List<LocalDate> findAvailableDatesByMovieId(Long movieId, LocalDateTime now);
}
