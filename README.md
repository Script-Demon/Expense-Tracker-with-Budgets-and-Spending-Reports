# Spring Boot / MySQL backend seam

The Preview uses seeded browser-local data so the dashboard can be reviewed without credentials or a shared database. This folder describes the production boundary requested for the application: a Java Spring Boot service backed by MySQL.

Suggested modules are `ExpenseController`, `CategoryController`, `BudgetController`, and `MonthlyReportController`, backed by JPA repositories for `expenses`, `categories`, and `budgets`. The browser-side state mirrors these records and expects the following resource shapes:

- `Expense`: `id`, `description`, `note`, `amount`, `date`, `category`.
- `Category`: `id`, `name`, `color`.
- `Budget`: `category`, `month`, `limitAmount`.

Validation should reject missing descriptions and categories, amounts less than or equal to zero, invalid ISO dates, and descriptions longer than 120 characters. Monthly reporting should aggregate by `YEAR(date), MONTH(date), category`, compare the result to the category/month budget, and return both totals and month-over-month deltas.

Recommended service routes are `GET/POST /api/expenses`, `PUT/DELETE /api/expenses/{id}`, `GET/POST /api/categories`, `GET/PUT /api/budgets/{month}`, and `GET /api/reports/monthly?month=2026-10`. The existing `server.mjs` only provides the Preview shell and `/api/health`; it can be replaced by the Spring Boot listener at deployment time.
