# Air-Assist.EU — Full‑Stack App ✈️

![Logo](frontend/src/assets/photos/logo.png)

[![Java](https://img.shields.io/badge/Java-21-red)](https://adoptium.net/) [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.x-6DB33F)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-19-DD0031)](https://angular.dev/) [![Node](https://img.shields.io/badge/Node.js-%E2%89%A520.x-339933)](https://nodejs.org/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-31648C)](https://www.postgresql.org/)

A modern web app for managing flight delay claims and related workflows.

- Backend: Spring Boot (JWT auth, JPA/PostgreSQL, MapStruct, Caffeine cache, mailing, PDF generation)
- Frontend: Angular 19 + PrimeNG + PrimeFlex + ngx-translate (EN/RO)

---

## Table of Contents
- Quick start
- Tech stack
- Architecture
- Project structure
- Configuration (DB, mail, env)
- Development workflow
- Build & test
- i18n
- Troubleshooting

---

## Quick start
Run backend and frontend in two terminals. Commands below are for Windows PowerShell.

### 1) Backend (API at http://localhost:8080)
```powershell
# From repo root
cd backend
# Run with Maven Wrapper
.\mvnw.cmd spring-boot:run
```

macOS/Linux:
```bash
cd backend
./mvnw spring-boot:run
```

### 2) Frontend (SPA at http://localhost:4200)
```powershell
cd frontend
npm ci --no-audit --no-fund
npm start
```

The SPA calls the API at `http://localhost:8080/api` (see `frontend/src/environments/`).

---

## Tech stack
- Backend
  - Java 21, Spring Boot 3.5.x
  - Spring Data JPA (PostgreSQL), Spring Security (JWT)
  - MapStruct (DTO mapping), Caffeine (caching)
  - OpenHTMLtoPDF + Thymeleaf templates (PDF generation in `backend/src/main/resources/templates`)
  - Mail: Spring Mail + Angus/Jakarta Mail
- Frontend
  - Angular 19, PrimeNG + PrimeFlex + PrimeIcons
  - ngx-translate (i18n) with English/Romanian resources

---

## Architecture
```mermaid
flowchart LR
  A[Angular 19 SPA] -- "REST /api" --> B[Spring Boot 3.5.x<br/>API]
  click A "http://localhost:4200" "Open SPA" _blank
  click B "http://localhost:8080" "Open API" _blank
  B -- JPA --> C[(PostgreSQL)]
  B -- Templates --> D[Thymeleaf + OpenHTMLtoPDF PDF generation]
  B -- SMTP --> E[Mail Provider]
```

---

## Project structure
```
backend/      # Spring Boot app
frontend/     # Angular app
```
Notable paths:
- Backend config: `backend/src/main/resources/application.properties`
- Email/PDF templates: `backend/src/main/resources/templates/`
- i18n: `frontend/src/assets/i18n/{en,ro}.json`

---

## Run

- Frontend: `cd frontend && ng serve` → http://localhost:4200
- Backend: `cd backend && ./mvnw spring-boot:run` → http://localhost:8080

---

## Build & test
- Backend
  - Build: `.\mvnw.cmd clean package`
  - Tests: `.\mvnw.cmd test`
  - Jar output in `backend/target/`
- Frontend
  - Build: `npm run build`
  - Tests (Karma/Jasmine): `npm test`

Optional production preview (serve `frontend/dist/` with any static server).

---

## i18n
Translations live in `frontend/src/assets/i18n/`:
- `en.json` — English
- `ro.json` — Romanian

Add new keys there and use `ngx-translate` pipes/services in templates/components.

---

## Troubleshooting
- Ensure Node 20+ and JDK 21 are installed and on PATH
- Postgres is running and credentials match `application.properties`
- CORS: API 8080, SPA 4200; allow SPA origin in backend CORS config if needed
- If PDFs render oddly, verify the bundled font `DejaVuSans.ttf` and HTML templates

---

Made with Spring Boot + Angular.
