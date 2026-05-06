package com.hms.patient.security;

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

        // PATIENT only: create own profile
        if (path.equals("/patients") && method.equals("POST")) {
            return checkRole(role, "PATIENT", response);
        }

        // PATIENT can update own profile, ADMIN can update any
        if (path.matches(".*/patients/\\d+") && method.equals("PUT")) {
            if (role.equals("PATIENT") || role.equals("ADMIN")) {
                return true;
            }
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden - requires PATIENT or ADMIN role\"}");
            return false;
        }

        // DELETE: ADMIN only
        if (path.matches(".*/patients/\\d+") && method.equals("DELETE")) {
            return checkRole(role, "ADMIN", response);
        }

        // GET my profile: PATIENT only (must be checked before GET /patients/{id})
        if (path.equals("/patients/my-profile") && method.equals("GET")) {
            return checkRole(role, "PATIENT", response);
        }

        // GET all patients: ADMIN and DOCTOR only
        if (path.equals("/patients") && method.equals("GET")) {
            if (role.equals("ADMIN") || role.equals("DOCTOR")) {
                return true;
            }
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden - requires ADMIN or DOCTOR role\"}");
            return false;
        }

        // GET specific patient: ADMIN or DOCTOR
        if (path.matches(".*/patients/\\d+") && method.equals("GET")) {
            if (role.equals("ADMIN") || role.equals("DOCTOR")) {
                return true;
            }
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden - requires ADMIN or DOCTOR role\"}");
            return false;
        }

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

