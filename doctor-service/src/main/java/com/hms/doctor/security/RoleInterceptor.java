package com.hms.doctor.security;

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

        // ADMIN only: approve doctor, delete doctor
        if (path.matches(".*/doctors/\\d+/approve") && method.equals("PUT")) {
            return checkRole(role, "ADMIN", response);
        }
        if (path.matches(".*/doctors/\\d+") && method.equals("DELETE")) {
            return checkRole(role, "ADMIN", response);
        }

        // DOCTOR only: create own profile
        if (path.equals("/doctors") && method.equals("POST")) {
            return checkRole(role, "DOCTOR", response);
        }

        // DOCTOR only: add medical history
        if (path.equals("/doctors/medical-history") && method.equals("POST")) {
            return checkRole(role, "DOCTOR", response);
        }

        // DOCTOR only: update medical history
        if (path.matches(".*/doctors/medical-history/\\d+") && method.equals("PUT")) {
            return checkRole(role, "DOCTOR", response);
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

