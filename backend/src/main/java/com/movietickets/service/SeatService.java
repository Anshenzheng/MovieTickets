package com.movietickets.service;

import com.movietickets.entity.*;
import com.movietickets.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final SeatLockRepository seatLockRepository;
    private final OrderSeatRepository orderSeatRepository;
    private final ScreeningRepository screeningRepository;
    private final UserService userService;

    @Value("${seat.lock.duration}")
    private int lockDuration;

    public List<Seat> getSeatsByHall(Long hallId) {
        return seatRepository.findByHallIdOrderBySeatRowAscSeatColAsc(hallId);
    }

    public Map<String, Object> getSeatStatusByScreening(Long screeningId) {
        Screening screening = screeningRepository.findById(screeningId)
                .orElseThrow(() -> new RuntimeException("场次不存在"));

        List<Seat> allSeats = seatRepository.findByHallIdOrderBySeatRowAscSeatColAsc(screening.getHallId());
        
        List<Long> soldSeatIds = orderSeatRepository.findSoldSeatIdsByScreeningId(screeningId);
        
        List<SeatLock> activeLocks = seatLockRepository.findActiveLocksByScreeningId(screeningId);
        Set<Long> lockedSeatIds = activeLocks.stream()
                .map(SeatLock::getSeatId)
                .collect(Collectors.toSet());

        Long currentUserId = userService.getCurrentUserId();
        Set<Long> myLockedSeatIds = new HashSet<>();
        if (currentUserId != null) {
            myLockedSeatIds = activeLocks.stream()
                    .filter(lock -> lock.getUserId().equals(currentUserId) && lock.getStatus() == SeatLock.SeatLockStatus.LOCKED)
                    .map(SeatLock::getSeatId)
                    .collect(Collectors.toSet());
        }

        Map<Long, String> seatStatusMap = new HashMap<>();
        for (Seat seat : allSeats) {
            if (soldSeatIds.contains(seat.getId())) {
                seatStatusMap.put(seat.getId(), "SOLD");
            } else if (myLockedSeatIds.contains(seat.getId())) {
                seatStatusMap.put(seat.getId(), "MY_LOCKED");
            } else if (lockedSeatIds.contains(seat.getId())) {
                seatStatusMap.put(seat.getId(), "LOCKED");
            } else {
                seatStatusMap.put(seat.getId(), "AVAILABLE");
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("seats", allSeats);
        result.put("seatStatus", seatStatusMap);
        result.put("soldSeats", soldSeatIds.size());
        result.put("lockedSeats", lockedSeatIds.size());
        result.put("availableSeats", allSeats.size() - soldSeatIds.size() - lockedSeatIds.size());

        return result;
    }

    @Transactional
    public List<SeatLock> lockSeats(Long screeningId, List<Long> seatIds) {
        Long userId = userService.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("请先登录");
        }

        Screening screening = screeningRepository.findById(screeningId)
                .orElseThrow(() -> new RuntimeException("场次不存在"));

        if (screening.getStatus() != Screening.ScreeningStatus.ACTIVE) {
            throw new RuntimeException("该场次已取消");
        }

        if (screening.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("该场次已开始，无法选座");
        }

        for (Long seatId : seatIds) {
            if (orderSeatRepository.existsByScreeningIdAndSeatId(screeningId, seatId)) {
                throw new RuntimeException("座位已被售出");
            }

            List<SeatLock.SeatLockStatus> activeStatuses = Arrays.asList(
                    SeatLock.SeatLockStatus.LOCKED,
                    SeatLock.SeatLockStatus.CONFIRMED
            );
            if (seatLockRepository.existsByScreeningIdAndSeatIdAndStatusIn(screeningId, seatId, activeStatuses)) {
                Optional<SeatLock> existingLock = seatLockRepository
                        .findByScreeningIdAndSeatIdAndStatus(screeningId, seatId, SeatLock.SeatLockStatus.LOCKED);
                if (existingLock.isPresent() && existingLock.get().getUserId().equals(userId)) {
                    continue;
                }
                throw new RuntimeException("座位已被锁定，请选择其他座位");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expireTime = now.plusSeconds(lockDuration);

        List<SeatLock> locks = new ArrayList<>();
        for (Long seatId : seatIds) {
            SeatLock lock = SeatLock.builder()
                    .screeningId(screeningId)
                    .seatId(seatId)
                    .userId(userId)
                    .lockTime(now)
                    .expireTime(expireTime)
                    .status(SeatLock.SeatLockStatus.LOCKED)
                    .build();
            locks.add(seatLockRepository.save(lock));
        }

        log.info("用户 {} 锁定了场次 {} 的座位: {}", userId, screeningId, seatIds);
        return locks;
    }

    @Transactional
    public void unlockSeats(Long screeningId, List<Long> seatIds) {
        Long userId = userService.getCurrentUserId();
        if (userId == null) {
            return;
        }

        for (Long seatId : seatIds) {
            Optional<SeatLock> lockOpt = seatLockRepository
                    .findByScreeningIdAndSeatIdAndStatus(screeningId, seatId, SeatLock.SeatLockStatus.LOCKED);
            if (lockOpt.isPresent() && lockOpt.get().getUserId().equals(userId)) {
                seatLockRepository.delete(lockOpt.get());
            }
        }
    }

    @Transactional
    public List<Long> confirmSeatLocks(Long screeningId, List<Long> seatIds, Long userId) {
        List<SeatLock> locks = new ArrayList<>();
        for (Long seatId : seatIds) {
            Optional<SeatLock> lockOpt = seatLockRepository
                    .findByScreeningIdAndSeatIdAndStatus(screeningId, seatId, SeatLock.SeatLockStatus.LOCKED);
            if (lockOpt.isPresent() && lockOpt.get().getUserId().equals(userId)) {
                locks.add(lockOpt.get());
            }
        }

        if (locks.size() != seatIds.size()) {
            throw new RuntimeException("部分座位锁定已过期，请重新选座");
        }

        List<Long> lockIds = locks.stream().map(SeatLock::getId).collect(Collectors.toList());
        seatLockRepository.confirmLocks(lockIds);
        return lockIds;
    }

    @Transactional
    public void expireOldLocks() {
        int expired = seatLockRepository.expireLocks(LocalDateTime.now());
        if (expired > 0) {
            log.info("已清理 {} 个过期的座位锁定", expired);
        }
    }
}
