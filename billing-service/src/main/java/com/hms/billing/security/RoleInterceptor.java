package com.hms.billing.security;

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

        // ADMIN or DOCTOR: create invoice
        if (path.equals("/billing") && method.equals("POST")) {
            if (role.equals("ADMIN") || role.equals("DOCTOR")) {
                return true;
            }
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden - requires ADMIN or DOCTOR role\"}");
            return false;
        }

        // GET all invoices: ADMIN or EMPLOYEE only
        if (path.equals("/billing") && method.equals("GET")) {
            if (role.equals("ADMIN") || role.equals("EMPLOYEE")) {
                return true;
            }
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden - requires ADMIN or EMPLOYEE role\"}");
            return false;
        }

        // GET my invoices: PATIENT only
        if (path.equals("/billing/my-invoices") && method.equals("GET")) {
            if (role.equals("PATIENT")) {
                return true;
            }
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden - requires PATIENT role\"}");
            return false;
        }

        // ADMIN or EMPLOYEE: mark as paid
        if (path.matches(".*/billing/\\d+/mark-paid") && method.equals("PUT")) {
            if (role.equals("ADMIN") || role.equals("EMPLOYEE")) {
                return true;
            }
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden - requires ADMIN or EMPLOYEE role\"}");
            return false;
        }

        // PATIENT: pay invoice
        if (path.matches(".*/billing/\\d+/pay") && method.equals("PUT")) {
            return checkRole(role, "PATIENT", response);
        }

        // Other GET endpoints: any authenticated user
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

