package com.movietickets.repository;

import com.movietickets.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNo(String orderNo);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Order.OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.status = 'PENDING' AND o.expireTime < :now")
    List<Order> findExpiredPendingOrders(LocalDateTime now);

    @Query("SELECT o FROM Order o JOIN FETCH o.screening s JOIN FETCH s.movie WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(Long id);

    @Query("SELECT o FROM Order o JOIN FETCH o.screening s JOIN FETCH s.movie WHERE o.orderNo = :orderNo")
    Optional<Order> findByOrderNoWithDetails(String orderNo);

    @Query("SELECT o FROM Order o JOIN FETCH o.screening s JOIN FETCH s.movie WHERE o.userId = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserIdWithDetails(Long userId);

    @Query("SELECT COUNT(os) FROM OrderSeat os WHERE os.screeningId = :screeningId")
    Long countSoldSeatsByScreeningId(Long screeningId);
}
