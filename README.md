# Todo Deluxe - Backend API

This is the Backend system for the **Todo Deluxe** application, built on the powerful [NestJS](https://nestjs.com/) framework. The project provides high-performance RESTful APIs to manage tasks, users, and related operations tightly and scalably.

## 🚀 Key Features

* **Task Management (Todo CRUD):** Create, read, update, and delete tasks.
* **Authentication & Authorization:** Manage login/registration with JWT (JSON Web Tokens).
* **Sorting & Filtering:** Support sorting tasks by status, date, or category.
* **Security:** Integrated with Helmet, Rate Limiting, and secure password hashing.

## 🛠 Tech Stack

* **Framework:** [NestJS](https://nestjs.com/) (Node.js)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Database:** PostgreSQL / MySQL (via Prisma)
* **Testing:** Jest (Unit Test & E2E Test)

## 📐 Architecture & Design Patterns

The system leverages the full power of Dependency Injection (DI) in NestJS, combined with Design Patterns such as *Singleton* (for Services) and *Decorator* (for Routing and Validation) to ensure the codebase remains clean, maintainable, and easily extensible.
