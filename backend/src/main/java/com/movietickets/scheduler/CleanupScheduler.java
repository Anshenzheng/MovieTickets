package com.movietickets.scheduler;

import com.movietickets.service.OrderService;
import com.movietickets.service.SeatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CleanupScheduler {

    private final SeatService seatService;
    private final OrderService orderService;

    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredLocks() {
        log.debug("开始清理过期的座位锁定...");
        seatService.expireOldLocks();
    }

    @Scheduled(fixedRate = 30000)
    public void cleanupExpiredOrders() {
        log.debug("开始清理过期的订单...");
        orderService.cancelExpiredOrders();
    }
}
