CREATE TABLE categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL UNIQUE,
  color VARCHAR(16) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budgets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  month_key CHAR(7) NOT NULL,
  limit_amount DECIMAL(12, 2) NOT NULL,
  UNIQUE KEY uq_budget_category_month (category_id, month_key),
  CONSTRAINT fk_budget_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT chk_budget_positive CHECK (limit_amount > 0)
);

CREATE TABLE expenses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  description VARCHAR(120) NOT NULL,
  note VARCHAR(120),
  amount DECIMAL(12, 2) NOT NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_expense_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT chk_expense_positive CHECK (amount > 0),
  INDEX ix_expense_date (expense_date),
  INDEX ix_expense_category_date (category_id, expense_date)
);

-- Monthly report query boundary used by the Spring service:
-- SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month_key,
--        category_id, SUM(amount) AS spent
-- FROM expenses
-- WHERE expense_date >= :monthStart AND expense_date < :nextMonthStart
-- GROUP BY month_key, category_id;
