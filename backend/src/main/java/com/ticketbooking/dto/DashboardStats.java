package com.ticketbooking.dto;

public class DashboardStats {

    private long totalBookings;
    private double totalRevenue;
    private long totalEvents;
    private long totalUsers;
    private long bookedSeats;
    private long availableSeats;

    public DashboardStats() {
    }

    public DashboardStats(long totalBookings, double totalRevenue, long totalEvents,
                          long totalUsers, long bookedSeats, long availableSeats) {
        this.totalBookings = totalBookings;
        this.totalRevenue = totalRevenue;
        this.totalEvents = totalEvents;
        this.totalUsers = totalUsers;
        this.bookedSeats = bookedSeats;
        this.availableSeats = availableSeats;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getBookedSeats() {
        return bookedSeats;
    }

    public void setBookedSeats(long bookedSeats) {
        this.bookedSeats = bookedSeats;
    }

    public long getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(long availableSeats) {
        this.availableSeats = availableSeats;
    }
}
