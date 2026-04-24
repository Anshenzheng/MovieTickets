package com.movietickets.repository;

import com.movietickets.entity.OrderSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderSeatRepository extends JpaRepository<OrderSeat, Long> {

    List<OrderSeat> findByOrderId(Long orderId);

    @Query("SELECT os FROM OrderSeat os JOIN FETCH os.seat WHERE os.orderId = :orderId")
    List<OrderSeat> findByOrderIdWithSeat(Long orderId);

    @Query("SELECT os.seatId FROM OrderSeat os WHERE os.screeningId = :screeningId")
    List<Long> findSoldSeatIdsByScreeningId(Long screeningId);

    boolean existsByScreeningIdAndSeatId(Long screeningId, Long seatId);
}
