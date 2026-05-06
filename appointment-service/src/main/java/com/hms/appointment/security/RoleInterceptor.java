package com.hms.appointment.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RoleInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String role = request.getHeader("X-User-Role");
        String method = request.getMethod();
        String path = request.getRequestURI();

        if (role == null || role.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Unauthorized - no role found\"}");
            return false;
        }

        // PATIENT only: book appointment
        if (path.equals("/appointments") && method.equals("POST")) {
            return checkRole(role, "PATIENT", response);
        }

        // DOCTOR or ADMIN: update status (confirm/complete)
        if (path.matches(".*/appointments/\\d+/status") && method.equals("PUT")) {
            if (role.equals("DOCTOR") || role.equals("ADMIN")) {
                return true;
            }
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden - requires DOCTOR or ADMIN role\"}");
            return false;
        }

        // PATIENT or ADMIN: cancel appointment
        if (path.matches(".*/appointments/\\d+/cancel") && method.equals("PUT")) {
            if (role.equals("PATIENT") || role.equals("ADMIN")) {
                return true;
            }
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden - requires PATIENT or ADMIN role\"}");
            return false;
        }

        // GET endpoints: any authenticated user
        return true;
    }

    private boolean checkRole(String userRole, String requiredRole, HttpServletResponse response) throws Exception {
        if (!userRole.equals(requiredRole)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden - requires " + requiredRole + " role\"}");
            return false;
        }
        return true;
    }
}
