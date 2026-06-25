package com.ticketbooking.repository;

import com.ticketbooking.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByEventId(Long eventId);

    List<Seat> findByEventIdAndStatus(Long eventId, String status);

    List<Seat> findByIdIn(List<Long> ids);
}
