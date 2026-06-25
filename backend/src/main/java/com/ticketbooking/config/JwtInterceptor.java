package com.ticketbooking.config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Allow pre-flight OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        // Skip auth check for auth endpoints, error dispatching, and public APIs
        if (path.equals("/error") ||
            path.startsWith("/api/auth/") || 
            (path.equals("/api/events") && "GET".equalsIgnoreCase(request.getMethod())) ||
            (path.startsWith("/api/events/") && path.endsWith("/seats") && "GET".equalsIgnoreCase(request.getMethod())) ||
            (path.startsWith("/api/events/") && "GET".equalsIgnoreCase(request.getMethod()))) {
            return true;
        }

        // Get JWT from cookie
        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized: Missing token\"}");
            return false;
        }

        Map<String, Object> claims = JwtUtil.parseToken(token);
        if (claims == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized: Invalid or expired token\"}");
            return false;
        }

        // Add user info to request attributes for controllers to use
        request.setAttribute("userId", ((Number) claims.get("userId")).longValue());
        request.setAttribute("userRole", claims.get("role"));
        request.setAttribute("userEmail", claims.get("email"));

        // If the path requires admin privileges, check it
        if (path.startsWith("/api/dashboard/") || 
            (path.startsWith("/api/events") && ("POST".equalsIgnoreCase(request.getMethod()) || "PUT".equalsIgnoreCase(request.getMethod()) || "DELETE".equalsIgnoreCase(request.getMethod())))) {
            String role = (String) claims.get("role");
            if (!"ADMIN".equalsIgnoreCase(role)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Forbidden: Admin access required\"}");
                return false;
            }
        }

        return true;
    }
}
