package com.ticketbooking.repository;

import com.ticketbooking.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByCategory(String category);

    List<Event> findByTitleContainingIgnoreCase(String title);

    List<Event> findByCategoryAndTitleContainingIgnoreCase(String category, String title);
}
