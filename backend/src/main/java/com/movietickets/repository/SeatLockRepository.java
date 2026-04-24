package com.movietickets.repository;

import com.movietickets.entity.SeatLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatLockRepository extends JpaRepository<SeatLock, Long> {

    Optional<SeatLock> findByScreeningIdAndSeatIdAndStatus(Long screeningId, Long seatId, SeatLock.SeatLockStatus status);

    List<SeatLock> findByScreeningIdAndStatus(Long screeningId, SeatLock.SeatLockStatus status);

    List<SeatLock> findByUserIdAndStatusOrderByLockTimeDesc(Long userId, SeatLock.SeatLockStatus status);

    @Query("SELECT sl FROM SeatLock sl WHERE sl.screeningId = :screeningId " +
           "AND sl.seatId IN :seatIds AND sl.status = 'LOCKED'")
    List<SeatLock> findLockedSeats(Long screeningId, List<Long> seatIds);

    @Modifying
    @Transactional
    @Query("UPDATE SeatLock sl SET sl.status = 'EXPIRED' WHERE sl.expireTime < :now AND sl.status = 'LOCKED'")
    int expireLocks(LocalDateTime now);

    @Modifying
    @Transactional
    @Query("UPDATE SeatLock sl SET sl.status = 'CONFIRMED' WHERE sl.id IN :ids")
    int confirmLocks(List<Long> ids);

    @Query("SELECT sl FROM SeatLock sl WHERE sl.screeningId = :screeningId " +
           "AND sl.status IN ('LOCKED', 'CONFIRMED')")
    List<SeatLock> findActiveLocksByScreeningId(Long screeningId);

    boolean existsByScreeningIdAndSeatIdAndStatusIn(Long screeningId, Long seatId, List<SeatLock.SeatLockStatus> statuses);
}
