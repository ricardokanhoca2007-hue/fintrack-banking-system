# FinTrack — Phase 1

This package contains the Phase 1 backend foundation for the FinTrack Banking System.

## Included

- Java 21
- Spring Boot 4.1.0
- Maven
- PostgreSQL
- Flyway database migrations
- Spring Data JPA
- Bean Validation
- Actuator
- Initial REST health endpoint

## Run PostgreSQL

From the `docker` directory:

```bash
docker compose up -d
```

## Run the backend

From the `backend` directory:

```bash
mvn spring-boot:run
```

The API should be available at:

`http://localhost:8080`

Health endpoint:

`http://localhost:8080/api/v1/health`

Actuator health:

`http://localhost:8080/actuator/health`

## Database

Flyway automatically applies:

`src/main/resources/db/migration/V1__initial_schema.sql`

Hibernate uses `ddl-auto=validate`, so the application validates the schema instead of modifying it automatically.
