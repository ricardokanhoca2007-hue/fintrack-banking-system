# FinTrack — Banking & Personal Finance Simulator

A full-stack fintech project designed to demonstrate software engineering skills through account management, financial data handling, REST API development, and a modern web interface.

> **Project status:** Work in progress. This is an educational banking simulator, not a real banking service.

## Overview

FinTrack is a portfolio project focused on building a maintainable full-stack application using Java, Spring Boot, PostgreSQL, React, and TypeScript.

The project is being developed to demonstrate backend engineering, database design, API development, frontend development, and containerized infrastructure.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Java 21, Spring Boot, Maven |
| Database | PostgreSQL |
| Database migrations | Flyway |
| API monitoring | Spring Boot Actuator |
| Infrastructure | Docker, Docker Compose |
| Version control | Git, GitHub |

## Architecture

```text
User
 |
 v
React + TypeScript Frontend
 |
 | HTTP / REST
 v
Spring Boot Backend
 |
 v
PostgreSQL Database
 ^
 |
Flyway Database Migrations
```

The frontend development server is configured to proxy `/api` and `/actuator` requests to the backend.

## Project Structure

```text
FinTrack_Project/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── README.md
├── docker/
│   └── docker-compose.yml
├── FinTrack Frontend Prototype/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md
```

## Prerequisites

Install the following tools before running the project:

- Git
- Java Development Kit (JDK) 21
- Apache Maven 3.9 or compatible
- Node.js and npm
- Docker Desktop with Docker Compose

Check your installations:

```powershell
git --version
java -version
mvn -version
node --version
npm --version
docker --version
docker compose version
```

## Getting Started

### 1. Clone the repository

```powershell
git clone https://github.com/ricardokanhoca2007-hue/fintrack-banking-system.git
Set-Location fintrack-banking-system
```

To access the initial development branch:

```powershell
git switch feature/fintrack-initial-version
```

### 2. Configure environment variables

Set the database password in your local PowerShell session. Use a password appropriate for your local environment and do not commit credentials.

```powershell
$env:POSTGRES_PASSWORD = "replace-with-your-local-password"
$env:DB_PASSWORD = $env:POSTGRES_PASSWORD
```

These values must match the credentials configured for PostgreSQL.

### 3. Start PostgreSQL

From the repository root:

```powershell
docker compose -f docker/docker-compose.yml up -d
```

**Important:** These instructions assume a fresh local setup. If you already have a PostgreSQL container and persistent database volume, do not delete the volume or recreate the database blindly. Check your existing database configuration first.

### 4. Run the backend

Open a PowerShell terminal:

```powershell
Set-Location .\backend
$env:DB_PASSWORD = "your-configured-database-password"
mvn spring-boot:run
```

If Maven is not available on your PATH, use your local Maven installation or configure Maven before running the command.

The backend runs on:

```text
http://localhost:8080
```

Check the health endpoint:

```text
http://localhost:8080/actuator/health
```

Retrieve the available accounts:

```text
http://localhost:8080/api/v1/accounts
```

You can also test these endpoints with a REST client such as Postman.

### 5. Run the frontend

Open a second PowerShell terminal from the repository root:

```powershell
Set-Location ".\FinTrack Frontend Prototype"
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal. The development server is configured to use port `8081` and proxy API requests to the backend on port `8080`.

## Development and Quality

Recommended practices for this project include:

- Keeping backend responsibilities separate from frontend presentation.
- Using database migrations to manage schema changes.
- Validating API inputs and handling errors consistently.
- Writing automated tests for core business logic and API endpoints.
- Keeping credentials and environment-specific configuration out of version control.
- Documenting API endpoints and setup instructions.

### Useful commands

Backend tests:

```powershell
Set-Location .\backend
mvn test
```

Frontend production build:

```powershell
Set-Location ".\FinTrack Frontend Prototype"
npm run build
```

Run these commands from the appropriate project directory.

## Current Scope and Limitations

FinTrack is under active development. The backend currently provides a health endpoint and account API backed by PostgreSQL, with initial database migrations and sample account data.

Not all frontend features have been verified as integrated with the backend. Authentication, authorization, transaction processing, and other banking workflows should not be considered production-ready unless they are implemented and tested.

## Roadmap

- [ ] Complete and document the account management API.
- [ ] Implement and test transaction workflows.
- [ ] Add authentication and authorization.
- [ ] Connect frontend features to backend endpoints.
- [ ] Add automated backend and frontend tests.
- [ ] Improve API documentation and error handling.
- [ ] Strengthen configuration and security practices.
- [ ] Improve CI/CD and containerized deployment.

## Disclaimer

This project is intended for educational and portfolio purposes only. It is not connected to real bank accounts, does not process real payments, and must not be used to store real financial credentials or sensitive financial data.

## Author

**Ricardo Kanhoca**

Computer Engineering student interested in software engineering, backend development, databases, and fintech systems.

GitHub: [@ricardokanhoca2007-hue](https://github.com/ricardokanhoca2007-hue)
