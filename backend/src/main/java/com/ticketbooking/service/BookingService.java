package com.ticketbooking.service;

import com.ticketbooking.dto.BookingRequest;
import com.ticketbooking.model.Booking;
import com.ticketbooking.model.Event;
import com.ticketbooking.model.Seat;
import com.ticketbooking.model.User;
import com.ticketbooking.repository.BookingRepository;
import com.ticketbooking.repository.EventRepository;
import com.ticketbooking.repository.SeatRepository;
import com.ticketbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Transactional
    public Booking createBooking(BookingRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + request.getEventId()));

        if (event.getBookingDeadline() != null && java.time.LocalDateTime.now().isAfter(event.getBookingDeadline())) {
            throw new RuntimeException("Booking deadline has passed for this event");
        }

        List<Seat> seats = seatRepository.findByIdIn(request.getSeatIds());

        if (seats.size() != request.getSeatIds().size()) {
            throw new RuntimeException("One or more seats not found");
        }

        for (Seat seat : seats) {
            if (!"AVAILABLE".equals(seat.getStatus())) {
                throw new RuntimeException("Seat " + seat.getSeatNumber() + " is already booked");
            }
            if (!seat.getEvent().getId().equals(event.getId())) {
                throw new RuntimeException("Seat " + seat.getSeatNumber() + " does not belong to this event");
            }
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setNumberOfSeats(seats.size());
        booking.setTotalAmount(event.getTicketPrice() * seats.size());
        booking.setStatus("CONFIRMED");
        booking.setPaymentStatus("PAID");

        String seatNumbers = seats.stream()
                .map(Seat::getSeatNumber)
                .collect(Collectors.joining(","));
        booking.setSeatNumbers(seatNumbers);

        Booking savedBooking = bookingRepository.save(booking);

        for (Seat seat : seats) {
            seat.setStatus("BOOKED");
            seat.setBookedByUserId(user.getId());
            seat.setBookingId(savedBooking.getId());
        }
        seatRepository.saveAll(seats);

        event.setAvailableSeats(event.getAvailableSeats() - seats.size());
        eventRepository.save(event);

        return savedBooking;
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByBookingDateDesc(userId);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled");
        }

        booking.setStatus("CANCELLED");
        booking.setPaymentStatus("REFUNDED");

        List<Seat> seats = seatRepository.findByEventId(booking.getEvent().getId());
        for (Seat seat : seats) {
            if (booking.getId().equals(seat.getBookingId())) {
                seat.setStatus("AVAILABLE");
                seat.setBookedByUserId(null);
                seat.setBookingId(null);
            }
        }
        seatRepository.saveAll(seats);

        Event event = booking.getEvent();
        event.setAvailableSeats(event.getAvailableSeats() + booking.getNumberOfSeats());
        eventRepository.save(event);

        return bookingRepository.save(booking);
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }
}
