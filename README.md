# FinTrack — Banking & Personal Finance Simulator

A full-stack fintech portfolio project built with Java, Spring Boot, PostgreSQL, React and TypeScript. Designed to demonstrate backend development, REST API engineering, relational database management and modern frontend development.

> **Project status:** Work in progress. FinTrack is an educational banking simulator developed for software engineering and portfolio purposes. It is not a real banking service.

## 1. Project Overview

FinTrack is a full-stack application focused on financial account management and personal finance.

The project explores the development of a maintainable software architecture, combining a Spring Boot REST API, a PostgreSQL relational database and a React-based user interface.

The main engineering objectives include:

- Building RESTful APIs using Java and Spring Boot.
- Designing and managing relational database schemas.
- Implementing database version control with Flyway.
- Developing a modern frontend with React and TypeScript.
- Integrating frontend and backend services through HTTP.
- Managing application configuration and environment variables.
- Using Docker to simplify database infrastructure.

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript 5.8 |
| Frontend tooling | Vite 8 |
| Styling | Tailwind CSS 4 |
| Backend | Java 21, Spring Boot 4.1 |
| API | Spring Web, REST |
| Validation | Spring Validation |
| Persistence | Spring Data JPA, Hibernate |
| Database | PostgreSQL 17 |
| Database migrations | Flyway |
| Monitoring | Spring Boot Actuator |
| Build automation | Maven |
| Infrastructure | Docker, Docker Compose |
| Version control | Git, GitHub |

## 3. System Architecture

```text
                 USER
                   |
                   v
       React + TypeScript Frontend
                   |
             HTTP / REST
                   |
                   v
          Spring Boot Backend
                   |
                   v
             Spring Data JPA
                   |
                   v
             PostgreSQL 17
                   ^
                   |
             Flyway Migrations
```

The frontend development server is configured to proxy `/api` and `/actuator` requests to the Spring Boot backend running on port `8080`.

## 4. Project Structure

```text
FinTrack_Project/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/migration/
│   │   └── test/
│   ├── pom.xml
│   └── README.md
│
├── docker/
│   └── docker-compose.yml
│
├── FinTrack Frontend Prototype/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

## 5. Prerequisites

Install the following tools:

- Git
- Java Development Kit (JDK) 21
- Apache Maven
- Node.js and npm
- Docker Desktop with Docker Compose

Verify the installations:

```powershell
git --version
java -version
mvn -version
node --version
npm --version
docker --version
docker compose version
```

## 6. Getting Started

### 6.1 Clone the repository

```powershell
git clone https://github.com/ricardokanhoca2007-hue/fintrack-banking-system.git

Set-Location fintrack-banking-system
```

### 6.2 Configure environment variables

The application uses environment variables to avoid storing database passwords directly in the configuration files.

In the first PowerShell terminal, configure the PostgreSQL password:

```powershell
$env:POSTGRES_PASSWORD = "your-local-password"
```

### 6.3 Start PostgreSQL with Docker Compose

From the repository root:

```powershell
docker compose -f docker/docker-compose.yml up -d
```

The PostgreSQL container uses:

| Configuration | Value |
|---|---|
| Database | fintrack |
| Username | fintrack |
| Password | Defined through POSTGRES_PASSWORD |
| Port | 5432 |
| Container | fintrack-postgres |

Docker Compose creates a persistent volume named `fintrack-postgres-data`.

**Important:** If you already have an existing database volume, do not remove it when restarting the project. Persistent database data should be preserved.

### 6.4 Run the backend

Open a second PowerShell terminal from the repository root.

Configure the same database password:

```powershell
$env:DB_PASSWORD = "your-local-password"
```

Start the Spring Boot application:

```powershell
mvn -f .\backend\pom.xml spring-boot:run
```

The backend will be available at:

```text
http://localhost:8080
```

### 6.5 Verify backend health

Open the following endpoint:

```text
http://localhost:8080/actuator/health
```

A successful response should report:

```json
{
  "status": "UP"
}
```

### 6.6 Run the frontend

Open a third PowerShell terminal from the repository root:

```powershell
Set-Location ".\FinTrack Frontend Prototype"
```

Install the dependencies:

```powershell
npm ci
```

Start the development server:

```powershell
npm run dev
```

Open the local development URL displayed in the terminal.

The Vite development server proxies API requests to the backend running on port `8080`.

## 7. Available API Endpoints

The backend currently exposes the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/actuator/health` | Application health monitoring |
| GET | `/api/v1/accounts` | Retrieve available accounts |

Example request:

```http
GET http://localhost:8080/api/v1/accounts
```

The accounts endpoint retrieves account information backed by PostgreSQL.

## 8. Database Management

FinTrack uses PostgreSQL and Flyway to manage database schema changes.

Database migrations are located in:

```text
backend/src/main/resources/db/migration/
```

Current migrations:

- `V1__initial_schema.sql` — Initial database schema.
- `V2__seed_demo_data.sql` — Sample demonstration data.

Hibernate is configured with schema validation (`ddl-auto: validate`), while Flyway manages database migrations.

## 9. Testing and Build

### Backend tests

From the repository root:

```powershell
mvn -f .\backend\pom.xml test
```

### Frontend production build

```powershell
Set-Location ".\FinTrack Frontend Prototype"

npm run build
```

### Frontend linting

```powershell
npm run lint
```

These commands can be used to check the backend tests, frontend production build and frontend code quality.

## 10. Security and Configuration

The project follows several configuration and security practices:

- Database credentials are supplied through environment variables.
- Passwords and sensitive configuration should not be committed to Git.
- Database schema changes are managed through Flyway.
- Hibernate validates the database schema.
- Backend request validation is supported through Spring Validation.

FinTrack is still under development. Authentication, authorization and other security-sensitive banking workflows must not be considered production-ready unless implemented and tested.

## 11. Current Scope and Limitations

The current backend implementation includes:

- Spring Boot application setup.
- PostgreSQL database integration.
- Flyway database migrations.
- Account entity and repository.
- Account REST API.
- Application health monitoring.
- Initial automated backend test.

The frontend includes a React and TypeScript application with financial dashboard and account-related interfaces.

Not all frontend features have been verified as fully integrated with the backend.

The application does not currently represent a production-ready banking platform.

## 12. Development Roadmap

- [ ] Expand account management functionality.
- [ ] Implement transaction management workflows.
- [ ] Implement authentication and authorization.
- [ ] Connect additional frontend features to backend endpoints.
- [ ] Expand automated backend and frontend testing.
- [ ] Improve API documentation.
- [ ] Strengthen security and configuration practices.
- [ ] Introduce automated CI/CD workflows.
- [ ] Improve deployment and containerization.

## 13. Disclaimer

FinTrack is an educational software engineering project developed for learning and portfolio purposes.

It is not connected to real bank accounts, does not process real payments and must not be used to store actual financial credentials or sensitive financial information.

## 14. Author

**Ricardo Kanhoca**

Computer Engineering student interested in:

- Software Engineering
- Backend Development
- Full-Stack Development
- Database Engineering
- Financial Technology (FinTech)

GitHub: [@ricardokanhoca2007-hue](https://github.com/ricardokanhoca2007-hue)

Project Repository: [FinTrack Banking System](https://github.com/ricardokanhoca2007-hue/fintrack-banking-system)