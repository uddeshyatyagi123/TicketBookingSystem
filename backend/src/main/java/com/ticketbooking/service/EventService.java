package com.ticketbooking.service;

import com.ticketbooking.dto.EventRequest;
import com.ticketbooking.model.Event;
import com.ticketbooking.model.Seat;
import com.ticketbooking.repository.EventRepository;
import com.ticketbooking.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Transactional
    public Event createEvent(EventRequest request) {
        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setCategory(request.getCategory());
        event.setVenue(request.getVenue());
        event.setDateTime(LocalDateTime.parse(request.getDateTime()));
        event.setTicketPrice(request.getTicketPrice());
        event.setTotalSeats(request.getTotalSeats());
        event.setAvailableSeats(request.getTotalSeats());
        event.setImageUrl(request.getImageUrl());
        if (request.getBookingDeadline() != null && !request.getBookingDeadline().isEmpty()) {
            event.setBookingDeadline(LocalDateTime.parse(request.getBookingDeadline()));
        } else {
            event.setBookingDeadline(null);
        }
        event.setGenre(request.getGenre());

        Event savedEvent = eventRepository.save(event);

        generateSeats(savedEvent, request.getTotalSeats());

        return savedEvent;
    }

    private void generateSeats(Event event, int totalSeats) {
        List<Seat> seats = new ArrayList<>();
        int seatsPerRow = 10;
        int seatCount = 0;

        for (int row = 0; seatCount < totalSeats; row++) {
            String rowLetter = String.valueOf((char) ('A' + row));
            int seatsInThisRow = Math.min(seatsPerRow, totalSeats - seatCount);

            for (int seatNum = 1; seatNum <= seatsInThisRow; seatNum++) {
                Seat seat = new Seat();
                seat.setSeatRow(rowLetter);
                seat.setSeatNumber(rowLetter + seatNum);
                seat.setEvent(event);
                seat.setStatus("AVAILABLE");
                seats.add(seat);
                seatCount++;
            }
        }

        seatRepository.saveAll(seats);
    }

    @Transactional
    public Event updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setCategory(request.getCategory());
        event.setVenue(request.getVenue());
        event.setDateTime(LocalDateTime.parse(request.getDateTime()));
        event.setTicketPrice(request.getTicketPrice());
        event.setImageUrl(request.getImageUrl());
        if (request.getBookingDeadline() != null && !request.getBookingDeadline().isEmpty()) {
            event.setBookingDeadline(LocalDateTime.parse(request.getBookingDeadline()));
        } else {
            event.setBookingDeadline(null);
        }
        event.setGenre(request.getGenre());

        if (request.getTotalSeats() != null && !request.getTotalSeats().equals(event.getTotalSeats())) {
            int difference = request.getTotalSeats() - event.getTotalSeats();
            event.setTotalSeats(request.getTotalSeats());
            event.setAvailableSeats(event.getAvailableSeats() + difference);
        }

        return eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));

        List<Seat> seats = seatRepository.findByEventId(id);
        seatRepository.deleteAll(seats);

        eventRepository.delete(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
    }

    public List<Event> searchEvents(String keyword, String category, String genre) {
        List<Event> events;
        if (keyword != null && !keyword.isEmpty() && category != null && !category.isEmpty()) {
            events = eventRepository.findByCategoryAndTitleContainingIgnoreCase(category, keyword);
        } else if (category != null && !category.isEmpty()) {
            events = eventRepository.findByCategory(category);
        } else if (keyword != null && !keyword.isEmpty()) {
            events = eventRepository.findByTitleContainingIgnoreCase(keyword);
        } else {
            events = eventRepository.findAll();
        }

        if (genre != null && !genre.isEmpty()) {
            events = events.stream()
                    .filter(e -> e.getGenre() != null && e.getGenre().equalsIgnoreCase(genre))
                    .collect(java.util.stream.Collectors.toList());
        }
        return events;
    }
}
