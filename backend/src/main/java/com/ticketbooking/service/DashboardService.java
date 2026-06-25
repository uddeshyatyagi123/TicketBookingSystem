package com.ticketbooking.service;

import com.ticketbooking.dto.DashboardStats;
import com.ticketbooking.repository.BookingRepository;
import com.ticketbooking.repository.EventRepository;
import com.ticketbooking.repository.SeatRepository;
import com.ticketbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SeatRepository seatRepository;

    public DashboardStats getStats() {
        Long totalBookings = bookingRepository.countConfirmedBookings();
        Double totalRevenue = bookingRepository.totalRevenue();
        long totalEvents = eventRepository.count();
        long totalUsers = userRepository.count();
        long bookedSeats = seatRepository.findAll().stream()
                .filter(seat -> "BOOKED".equals(seat.getStatus()))
                .count();
        long availableSeats = seatRepository.findAll().stream()
                .filter(seat -> "AVAILABLE".equals(seat.getStatus()))
                .count();

        return new DashboardStats(
                totalBookings != null ? totalBookings : 0L,
                totalRevenue != null ? totalRevenue : 0.0,
                totalEvents,
                totalUsers,
                bookedSeats,
                availableSeats
        );
    }
}
