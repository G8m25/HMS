
• You are free to choose the idea of your application. 
• You are required to develop an application using Spring Boot as the backend 
framework. 
• APIs are mandatory — the application must be built using Spring Boot REST APIs. 
• For the frontend, you may use any technology or framework of your choice.
• Your application should contain at least four functional modules. 
• The application must implement different user roles e.g. (Admin, Employee …. ) and 
manage API authorization to control access based on roles. 
• Aspect-Oriented Programming (AOP) must be used. 
• The application must be Dockerized for easy deployment. 
• Microservices and Spring cloud are required. 
• A database is required. 
• The system must include user registration and authentication logic. 
• You must prepare a complete Software Requirements Specification (SRS) 
document. 
• Include all essential system diagrams such as: Use Case Diagram, Class Diagram, 
Sequence Diagrams and activity diagrams. 

Project Overview: Hospital Management System
This is a robust, secure, and scalable Hospital Management System (HMS) built using the Spring Boot framework. The system is designed to streamline the interaction between administrators, doctors, and patients, ensuring secure data handling and efficient medical workflow management.

1. Key Functionalities
User Management: Handles registration and profiles for three primary roles: ADMIN, DOCTOR, and PATIENT.

Secure Authentication: Implements a stateless authentication mechanism using JWT (JSON Web Tokens).

Doctor Onboarding Flow: Doctors can register but remain inactive (isApproved = false) until an Administrator reviews their credentials and activates their account.

Role-Based Access Control (RBAC): Restricts access to specific endpoints based on user authorities (e.g., only Admins can approve doctors).

Data Integrity: Manages complex entity relationships, such as the One-to-One mapping between User and Doctor using @MapsId.

2. System Architecture
The project follows a Layered Monolithic Architecture, ensuring a clean separation of concerns:

Controller Layer: REST Endpoints that handle incoming HTTP requests and map them to DTOs.

Service Layer: Contains the core business logic, including password encoding and transactional database operations.

Repository Layer: Utilizes Spring Data JPA for seamless interaction with the MariaDB/MySQL database.

Entity Layer: Defines the database schema using JPA annotations (Entities: User, Doctor, Admin, etc.).

Security Layer: A custom security filter chain (JwtAuthenticationFilter) that intercepts requests to validate tokens and set security contexts.

3. Tech Stack
Backend: Java 17, Spring Boot 3.x, Spring Security 6.

Database: MySQL / MariaDB (Managed via DBeaver).

Security: JWT (jjwt library).

Tools: Maven (Dependency Management), Postman (API Testing).