package com.movietickets.service;

import com.movietickets.entity.Screening;
import com.movietickets.repository.ScreeningRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScreeningService {

    private final ScreeningRepository screeningRepository;

    public List<Screening> getScreeningsByMovie(Long movieId) {
        return screeningRepository.findByMovieIdAndStatusAndStartTimeAfterOrderByStartTime(
                movieId, Screening.ScreeningStatus.ACTIVE, LocalDateTime.now());
    }

    public List<Screening> getScreeningsByMovieAndDate(Long movieId, LocalDate date) {
        return screeningRepository.findByMovieIdAndDate(movieId, date);
    }

    public List<LocalDate> getAvailableDatesByMovie(Long movieId) {
        return screeningRepository.findAvailableDatesByMovieId(movieId, LocalDateTime.now());
    }

    public Screening getScreeningById(Long id) {
        return screeningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("场次不存在"));
    }

    @Transactional
    public Screening createScreening(Screening screening) {
        screening.setStatus(Screening.ScreeningStatus.ACTIVE);
        return screeningRepository.save(screening);
    }

    @Transactional
    public Screening updateScreening(Long id, Screening screeningDetails) {
        Screening screening = screeningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("场次不存在"));

        screening.setMovieId(screeningDetails.getMovieId());
        screening.setHallId(screeningDetails.getHallId());
        screening.setStartTime(screeningDetails.getStartTime());
        screening.setEndTime(screeningDetails.getEndTime());
        screening.setPrice(screeningDetails.getPrice());
        screening.setLanguage(screeningDetails.getLanguage());
        screening.setVersion(screeningDetails.getVersion());
        screening.setStatus(screeningDetails.getStatus());

        return screeningRepository.save(screening);
    }

    @Transactional
    public void cancelScreening(Long id) {
        Screening screening = screeningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("场次不存在"));
        screening.setStatus(Screening.ScreeningStatus.CANCELLED);
        screeningRepository.save(screening);
    }
}
