package com.movietickets.repository;

import com.movietickets.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByHallIdOrderBySeatRowAscSeatColAsc(Long hallId);

    Optional<Seat> findByHallIdAndSeatRowAndSeatCol(Long hallId, Integer seatRow, Integer seatCol);

    List<Seat> findByIdIn(List<Long> seatIds);
}
