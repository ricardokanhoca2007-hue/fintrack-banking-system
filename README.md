\# FinTrack — Banking \& Personal Finance Simulator



A full-stack personal finance application built to explore modern web development, REST API design, relational data persistence, and financial dashboard interfaces.



\*\*FinTrack\*\* is a portfolio project developed with React and TypeScript on the frontend, Java and Spring Boot on the backend, and PostgreSQL for persistent data storage.



> \\\\\\\*\\\\\\\*Project status:\\\\\\\*\\\\\\\* In development. This is an educational simulator using demonstration data, not a real banking service.



\## Overview



FinTrack aims to provide a clear interface for exploring personal finance workflows, including account balances, transaction history, budgeting, savings goals, and financial insights.



The project combines a modern frontend with a backend API and a relational database, with an emphasis on maintainable code, clear separation of concerns, and reproducible local development.



\## Key Features



\### Frontend

\- Interactive financial dashboard and account views.

\- Transaction history interface and movement dialogs.

\- Budget, savings goal, and card-management interfaces.

\- Data visualisation and financial summaries.

\- Responsive application layout and reusable UI components.



\*The degree of backend integration and persistence varies by feature and is still being validated.\*



\### Backend

\- REST API built with Java and Spring Boot.

\- Account data exposed through a versioned API.

\- PostgreSQL integration using Spring Data JPA.

\- Database schema management and demonstration data through Flyway migrations.

\- Application health monitoring through Spring Boot Actuator.



\### Database and Development

\- PostgreSQL running in Docker.

\- Docker Compose configuration for the database.

\- Environment-variable-based database configuration.

\- Git version control and a modular project structure.



\## Technology Stack



| Area | Technologies |

|---|---|

| Frontend | React, TypeScript, Vite |

| Styling and UI | Tailwind CSS, reusable UI components |

| Backend | Java 21, Spring Boot |

| API | REST, JSON |

| Persistence | Spring Data JPA, Hibernate |

| Database | PostgreSQL |

| Database migrations | Flyway |

| Build tools | npm, Maven |

| Local infrastructure | Docker, Docker Compose |

| Monitoring | Spring Boot Actuator |



\## Architecture



```text

┌─────────────────────────────────┐

│       React + TypeScript        │

│        Vite development         │

└────────────────┬────────────────┘

\\\&#x20;                │ HTTP / JSON

\\\&#x20;                ▼

┌─────────────────────────────────┐

│      Spring Boot REST API       │

│      Java 21 · Maven · JPA      │

└────────────────┬────────────────┘

\\\&#x20;                │ SQL

\\\&#x20;                ▼

┌─────────────────────────────────┐

│           PostgreSQL            │

│      Flyway-managed schema      │

└─────────────────────────────────┘

```



The frontend and backend run as separate applications during development. Docker Compose provides the PostgreSQL service.



\## Project Structure



```text

FinTrack\\\\\\\_Project/

├── FinTrack Frontend Prototype/

│   ├── public/

│   ├── src/

│   │   ├── components/

│   │   ├── data/

│   │   ├── hooks/

│   │   ├── lib/

│   │   ├── routes/

│   │   └── store/

│   ├── package.json

│   └── vite.config.ts

├── backend/

│   ├── src/

│   │   ├── main/

│   │   │   ├── java/

│   │   │   └── resources/

│   │   │       └── db/migration/

│   │   └── test/

│   └── pom.xml

├── docker/

│   └── docker-compose.yml

└── README.md

```



\## Getting Started



Follow these instructions to run the project locally on a new machine.



\### Prerequisites



Install the following tools:



\- \[Git](https://git-scm.com/downloads)

\- \[Java JDK 21](https://adoptium.net/)

\- \[Apache Maven 3.9+](https://maven.apache.org/download.cgi)

\- \[Node.js and npm](https://nodejs.org/)

\- \[Docker Desktop](https://www.docker.com/products/docker-desktop/)



Verify the installations:



```bash

git --version

java -version

mvn -version

node --version

npm --version

docker --version

docker compose version

```



\### 1. Clone the repository



```bash

git clone https://github.com/ricardokanhoca2007-hue/fintrack-banking-system.git

cd fintrack-banking-system

```



The current development version is available on the `feature/fintrack-initial-version` branch:



```bash

git switch feature/fintrack-initial-version

```



\### 2. Start PostgreSQL



From the repository root, configure a local development password and start the database.



\*\*PowerShell (Windows):\*\*



```powershell

$env:POSTGRES\\\\\\\_PASSWORD = "change-this-local-password"

$env:DB\\\\\\\_PASSWORD = $env:POSTGRES\\\\\\\_PASSWORD



docker compose -f docker/docker-compose.yml up -d postgres

```



Replace the example password with a suitable local development value. The same value must be supplied to both variables for a fresh local setup.



Check that the database container is running:



```powershell

docker ps

```



The Compose configuration publishes PostgreSQL on port `5432`. Ensure that this port is available.



\### 3. Start the backend



Open a terminal in the repository root and configure the database password in that terminal session:



```powershell

$env:DB\\\\\\\_PASSWORD = "change-this-local-password"

Set-Location backend

mvn spring-boot:run

```



Use the same password configured for PostgreSQL. The backend runs on port `8080`.



On a fresh database, Flyway applies the versioned migrations during application startup.



\### 4. Verify the API



Once the backend has started, open:



\- Health endpoint: `http://localhost:8080/actuator/health`

\- Accounts endpoint: `http://localhost:8080/api/v1/accounts`



The health endpoint should report an `UP` status when the application is healthy. The accounts endpoint returns the available demonstration accounts.



\### 5. Start the frontend



Open a \*\*separate terminal\*\* from the repository root:



```powershell

Set-Location "FinTrack Frontend Prototype"

npm install

npm run dev

```



Open the local URL printed by Vite in the terminal. The development server is configured to proxy API and Actuator requests to the backend on port `8080`.



Keep the database, backend, and frontend running while using the application.



\## Configuration



The backend reads its database password from the `DB\\\\\\\_PASSWORD` environment variable.



Do not commit real credentials, private keys, or local `.env` files. Use environment variables for local configuration and use your own development credentials.



The Docker Compose configuration requires `POSTGRES\\\\\\\_PASSWORD` when creating a new database container.



\*\*Important:\*\* changing the Compose password variable does not change the password of an already-initialised PostgreSQL data volume. Existing local databases must retain their matching credentials unless the database password is deliberately changed.



\## Running Tests and Building



\### Backend



From the `backend/` directory:



```bash

mvn test

mvn package

```



\### Frontend



From the `FinTrack Frontend Prototype/` directory:



```bash

npm run build

```



The frontend production build should complete without errors before changes are submitted.



\## Current Limitations



\- FinTrack is a demonstration project, not a real banking platform.

\- The backend API currently exposes account data and health information; broader API coverage is still under development.

\- Frontend modules may use demonstration or client-side state where complete backend integration has not yet been implemented.

\- Production-grade authentication, authorisation, transaction security, and deployment hardening are not yet claimed as complete.



\## Roadmap



\- \[ ] Complete backend integration for supported financial workflows.

\- \[ ] Implement and test transaction persistence and account balance updates through the API.

\- \[ ] Add validation and consistent API error handling.

\- \[ ] Expand automated tests for controllers, services, and persistence.

\- \[ ] Introduce authentication and authorisation before any production-oriented use.

\- \[ ] Add automated quality checks and a CI workflow.

\- \[ ] Document API contracts and add screenshots of the working application.



\## Engineering Goals



This project is an opportunity to practise and demonstrate:



\- Full-stack application development.

\- REST API design and integration.

\- Relational data modelling and database migrations.

\- Separation of frontend, backend, and infrastructure concerns.

\- Environment-based configuration and reproducible development.

\- Testing, documentation, and version control.



\## Disclaimer



FinTrack is for educational and portfolio demonstration purposes only. It is not connected to financial institutions, does not process real payments, and must not be used to store real banking credentials or sensitive financial information.



\## Author



\*\*Ricardo Kanhoca\*\*



Computer Engineering student interested in software engineering, backend development, APIs, databases, and financial technology.



\- GitHub: \[@ricardokanhoca2007-hue](https://github.com/ricardokanhoca2007-hue)

\- Project repository: \[fintrack-banking-system](https://github.com/ricardokanhoca2007-hue/fintrack-banking-system)

