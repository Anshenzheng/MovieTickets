package com.movietickets.service;

import com.movietickets.entity.*;
import com.movietickets.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderSeatRepository orderSeatRepository;
    private final SeatService seatService;
    private final UserService userService;
    private final ScreeningService screeningService;

    @Value("${seat.lock.duration}")
    private int orderExpireSeconds;

    @Transactional
    public Order createOrder(Long screeningId, List<Long> seatIds) {
        Long userId = userService.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("请先登录");
        }

        Screening screening = screeningService.getScreeningById(screeningId);
        
        seatService.confirmSeatLocks(screeningId, seatIds, userId);

        String orderNo = generateOrderNo();

        BigDecimal totalAmount = screening.getPrice().multiply(BigDecimal.valueOf(seatIds.size()));

        Order order = Order.builder()
                .orderNo(orderNo)
                .userId(userId)
                .screeningId(screeningId)
                .totalAmount(totalAmount)
                .seatCount(seatIds.size())
                .status(Order.OrderStatus.PENDING)
                .expireTime(LocalDateTime.now().plusSeconds(orderExpireSeconds))
                .build();

        order = orderRepository.save(order);

        for (Long seatId : seatIds) {
            OrderSeat orderSeat = OrderSeat.builder()
                    .orderId(order.getId())
                    .seatId(seatId)
                    .screeningId(screeningId)
                    .seatPrice(screening.getPrice())
                    .build();
            orderSeatRepository.save(orderSeat);
        }

        log.info("用户 {} 创建订单 {}，场次 {}，座位 {}", userId, orderNo, screeningId, seatIds);
        return order;
    }

    public Order getOrderById(Long id) {
        return orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
    }

    public Order getOrderByOrderNo(String orderNo) {
        return orderRepository.findByOrderNoWithDetails(orderNo)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
    }

    public List<Order> getMyOrders() {
        Long userId = userService.getCurrentUserId();
        if (userId == null) {
            return new ArrayList<>();
        }
        return orderRepository.findByUserIdWithDetails(userId);
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdWithDetails(userId);
    }

    public List<OrderSeat> getOrderSeats(Long orderId) {
        return orderSeatRepository.findByOrderIdWithSeat(orderId);
    }

    @Transactional
    public Order payOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("订单状态不正确");
        }

        if (LocalDateTime.now().isAfter(order.getExpireTime())) {
            order.setStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(order);
            throw new RuntimeException("订单已过期");
        }

        order.setStatus(Order.OrderStatus.PAID);
        order.setPaymentTime(LocalDateTime.now());
        order = orderRepository.save(order);

        log.info("订单 {} 支付成功", order.getOrderNo());
        return order;
    }

    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        if (order.getStatus() == Order.OrderStatus.PAID) {
            throw new RuntimeException("已支付的订单无法取消，请申请退款");
        }

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("订单已取消");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        log.info("订单 {} 已取消", order.getOrderNo());
        return order;
    }

    @Transactional
    public void cancelExpiredOrders() {
        List<Order> expiredOrders = orderRepository.findExpiredPendingOrders(LocalDateTime.now());
        for (Order order : expiredOrders) {
            order.setStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(order);
            log.info("订单 {} 因超期未支付已取消", order.getOrderNo());
        }
    }

    private String generateOrderNo() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "MT" + timestamp + random;
    }
}
