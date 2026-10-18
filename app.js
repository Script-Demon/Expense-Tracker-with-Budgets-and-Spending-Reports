const STORAGE_KEY = 'expense-tracker-preview-v1';

const palette = {
  Housing: '#22c55e',
  Food: '#9b8afb',
  Transport: '#60a5fa',
  Utilities: '#f59e0b',
  Health: '#f472b6',
  Learning: '#a78bfa',
  Leisure: '#38bdf8'
};

const categoryIcons = { Housing: '⌂', Food: '∷', Transport: '↗', Utilities: '◌', Health: '+', Learning: '⌁', Leisure: '✦' };

const seed = {
  categories: [
    { id: 'housing', name: 'Housing', color: palette.Housing },
    { id: 'food', name: 'Food', color: palette.Food },
    { id: 'transport', name: 'Transport', color: palette.Transport },
    { id: 'utilities', name: 'Utilities', color: palette.Utilities },
    { id: 'health', name: 'Health', color: palette.Health },
    { id: 'learning', name: 'Learning', color: palette.Learning },
    { id: 'leisure', name: 'Leisure', color: palette.Leisure }
  ],
  budgets: { Housing: 1650, Food: 720, Transport: 320, Utilities: 210, Health: 280, Learning: 300, Leisure: 720 },
  expenses: [
    { id: 'e1', description: 'October rent', note: 'Apartment', amount: 1450, date: '2026-10-02', category: 'Housing' },
    { id: 'e2', description: 'Weekly groceries', note: 'Market Hall', amount: 86.42, date: '2026-10-03', category: 'Food' },
    { id: 'e3', description: 'Metro pass', note: 'Monthly pass', amount: 64, date: '2026-10-04', category: 'Transport' },
    { id: 'e4', description: 'Electricity bill', note: 'September usage', amount: 91.20, date: '2026-10-05', category: 'Utilities' },
    { id: 'e5', description: 'Dinner with Maya', note: 'Northside', amount: 52.80, date: '2026-10-06', category: 'Food' },
    { id: 'e6', description: 'Product design course', note: 'Module 04', amount: 180, date: '2026-10-08', category: 'Learning' },
    { id: 'e7', description: 'Pharmacy run', note: 'Vitamins + care', amount: 44.90, date: '2026-10-10', category: 'Health' },
    { id: 'e8', description: 'Morning coffee', note: 'Corner cup', amount: 6.50, date: '2026-10-12', category: 'Food' },
    { id: 'e9', description: 'Hotel deposit', note: 'Long weekend', amount: 221, date: '2026-10-14', category: 'Leisure' },
    { id: 'e10', description: 'Concert tickets', note: 'The Lanterns', amount: 84, date: '2026-10-15', category: 'Leisure' },
    { id: 'e11', description: 'Weekly groceries', note: 'Market Hall', amount: 112.30, date: '2026-10-17', category: 'Food' },
    { id: 'e12', description: 'Design software', note: 'Monthly plan', amount: 29.99, date: '2026-10-18', category: 'Learning' },
    { id: 'e13', description: 'Taxi home', note: 'Rainy evening', amount: 28.50, date: '2026-10-19', category: 'Transport' },
    { id: 'e14', description: 'Sunday dinner', note: 'Little Fern', amount: 74.10, date: '2026-10-20', category: 'Food' },
    { id: 'e15', description: 'Gym membership', note: 'October plan', amount: 48, date: '2026-10-21', category: 'Health' },
    { id: 'e16', description: 'Home internet', note: 'Fiber plan', amount: 69.99, date: '2026-10-22', category: 'Utilities' },
    { id: 'e17', description: 'Weekend stay', note: 'Lake trip', amount: 260, date: '2026-10-23', category: 'Leisure' },
    { id: 's1', description: 'September rent', note: 'Apartment', amount: 1450, date: '2026-09-02', category: 'Housing' },
    { id: 's2', description: 'September groceries', note: 'Market Hall', amount: 210, date: '2026-09-08', category: 'Food' },
    { id: 's3', description: 'September utilities', note: 'Power + fiber', amount: 112.40, date: '2026-09-12', category: 'Utilities' },
    { id: 's4', description: 'September long weekend', note: 'Coastal stay', amount: 700, date: '2026-09-21', category: 'Leisure' }
  ]
};

let state = loadState();
let activeSection = 'overview';
let activeFilter = 'all';
let toastTimer;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const shortMoney = (value) => value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : money(value);
const dateLabel = (value) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`));
const monthExpenses = () => state.expenses.filter((expense) => expense.date.startsWith(state.selectedMonth));
const totalSpent = () => monthExpenses().reduce((sum, expense) => sum + Number(expense.amount), 0);
const budgetsForMonth = () => state.budgetsByMonth?.[state.selectedMonth] || state.budgets || {};
const totalBudget = () => Object.values(budgetsForMonth()).reduce((sum, amount) => sum + Number(amount), 0);
const monthLabel = (monthKey) => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(`${monthKey}-01T12:00:00`));
const monthName = (monthKey) => new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(`${monthKey}-01T12:00:00`));
const previousMonthKey = (monthKey) => { const date = new Date(`${monthKey}-01T12:00:00`); date.setMonth(date.getMonth() - 1); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; };
const daysInMonth = (monthKey) => new Date(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5, 7)), 0).getDate();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.expenses && saved?.budgets && saved?.categories) {
      return { ...saved, selectedMonth: saved.selectedMonth || '2026-10', budgetsByMonth: saved.budgetsByMonth || { '2026-10': structuredClone(saved.budgets), '2026-09': structuredClone(saved.budgets) } };
    }
  } catch { /* start with demo state */ }
  const initial = structuredClone(seed);
  return { ...initial, selectedMonth: '2026-10', budgetsByMonth: { '2026-10': structuredClone(initial.budgets), '2026-09': structuredClone(initial.budgets) } };
}

function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function categoryColor(name) { return state.categories.find((category) => category.name === name)?.color || palette[name] || '#8492a6'; }
function categoryIcon(name) { return categoryIcons[name] || name.slice(0, 1).toUpperCase(); }
function sumByCategory(name) { return monthExpenses().filter((expense) => expense.category === name).reduce((sum, expense) => sum + Number(expense.amount), 0); }
function showToast(message) { $('#toastMessage').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2600); }

function render() {
  const expenses = monthExpenses();
  const spent = totalSpent();
  const budget = totalBudget();
  const remaining = budget - spent;
  const allocation = budget ? (spent / budget) * 100 : 0;
  const selectedLabel = monthLabel(state.selectedMonth);
  const previousTotal = state.expenses.filter((expense) => expense.date.startsWith(previousMonthKey(state.selectedMonth))).reduce((sum, expense) => sum + Number(expense.amount), 0);
  const monthlyDelta = previousTotal ? ((spent - previousTotal) / previousTotal) * 100 : null;

  $('#currentMonthLabel').textContent = selectedLabel;
  $('#monthSwitcherLabel').textContent = selectedLabel.slice(0, 3).toUpperCase();
  $('#monthHeadline').textContent = monthName(state.selectedMonth);
  $('#reportMonthHeadline').textContent = monthName(state.selectedMonth);
  document.title = `Expense Tracker · ${selectedLabel}`;
  $('#totalSpent').textContent = money(spent);
  $('#chartTotal').textContent = money(spent);
  $('#donutTotal').textContent = shortMoney(spent);
  $('#monthlyBudget').textContent = money(budget);
  $('#remainingBudget').textContent = money(remaining);
  $('#budgetFoot').textContent = `${allocation.toFixed(1)}% allocated`;
  $('#dailyPace').textContent = `${money(spent / daysInMonth(state.selectedMonth))} / day pace`;
  $('#allCount').textContent = expenses.length;
  $('#savingsRate').textContent = `${Math.max(0, 100 - allocation).toFixed(1)}%`;
  $('#statPeriod').textContent = `${selectedLabel.slice(0, 3).toUpperCase()} 01 — ${daysInMonth(state.selectedMonth)}`;
  $('#spentTrend').textContent = monthlyDelta === null ? 'No baseline' : `${monthlyDelta >= 0 ? '↑' : '↓'} ${Math.abs(monthlyDelta).toFixed(1)}%`;
  $('#spentTrend').className = `trend-badge ${monthlyDelta !== null && monthlyDelta > 0 ? 'trend-warn' : 'trend-good'}`;
  $('#spentComparison').textContent = `vs. ${monthName(previousMonthKey(state.selectedMonth))}`;

  renderOverviewFilters();
  renderChart(expenses);
  renderCategoryMix(expenses, spent);
  renderBudgetList();
  renderExpenseRows($('#expenseRows'), $('#expenseSearch')?.value || '');
  renderTransactionTools();
  renderBudgetOverview();
  renderCategoryGrid();
  renderReports(expenses, spent, budget);
  fillCategoryOptions();
}

function renderChart(expenses) {
  const previousExpenses = state.expenses.filter((expense) => expense.date.startsWith(previousMonthKey(state.selectedMonth)));
  const chartDays = 31;
  const selectedDayCount = daysInMonth(state.selectedMonth);
  const previousDayCount = daysInMonth(previousMonthKey(state.selectedMonth));
  const cumulative = (items, dayCount, index) => items.filter((expense) => Number(expense.date.slice(-2)) <= Math.min(index + 1, dayCount)).reduce((sum, expense) => sum + Number(expense.amount), 0);
  const byDay = Array.from({ length: chartDays }, (_, index) => cumulative(expenses, selectedDayCount, index));
  const previousByDay = Array.from({ length: chartDays }, (_, index) => cumulative(previousExpenses, previousDayCount, index));
  const max = Math.max(totalBudget(), ...byDay, ...previousByDay, 1);
  const x = (index) => 42 + (index / 30) * 700;
  const y = (value) => 224 - (value / max) * 200;
  const makeLine = (values) => `M ${values.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(' L ')}`;
  const line = makeLine(byDay);
  $('#trendPath').setAttribute('d', line);
  $('#previousPath').setAttribute('d', makeLine(previousByDay));
  $('#areaPath').setAttribute('d', `${line} L ${x(30)},224 L ${x(0)},224 Z`);
  const meaningful = [0, 2, 5, 9, 13, 16, 20, 23, 26, 30].filter((index) => byDay[index] > 0 || index === 30);
  $('#trendDots').innerHTML = meaningful.map((index) => `<circle class="chart-dot ${index === 30 ? 'last' : ''}" cx="${x(index)}" cy="${y(byDay[index])}" r="${index === 30 ? 4.5 : 3}" />`).join('');
  const previousTotal = previousByDay[30];
  const delta = previousTotal ? ((byDay[30] - previousTotal) / previousTotal) * 100 : null;
  const axisMoney = (value) => value === 0 ? '$0' : value >= 1000 ? `$${(value / 1000).toFixed(1).replace('.0', '')}k` : `$${Math.round(value)}`;
  [['#yLabelTop', max], ['#yLabel75', max * .75], ['#yLabel50', max * .5], ['#yLabel25', max * .25], ['#yLabelZero', 0]].forEach(([selector, value]) => { $(selector).textContent = axisMoney(value); });
  $('#chartCurrentLegend').textContent = monthName(state.selectedMonth);
  $('#chartPreviousLegend').textContent = monthName(previousMonthKey(state.selectedMonth));
  $('#chartDelta').textContent = delta === null ? 'No prior-month baseline' : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% month over month`;
  $('#trendChart').setAttribute('aria-label', `Cumulative spending trend for ${monthLabel(state.selectedMonth)}`);
  const monthShort = monthName(state.selectedMonth).slice(0, 3).toUpperCase();
  [1, 8, 15, 22, selectedDayCount].forEach((day, index) => { $(`#xLabel${index + 1}`).textContent = `${String(day).padStart(2, '0')} ${monthShort}`; });
}

function renderCategoryMix(expenses, spent) {
  const totals = state.categories.map((category) => ({ ...category, total: expenses.filter((expense) => expense.category === category.name).reduce((sum, expense) => sum + Number(expense.amount), 0) })).filter((category) => category.total > 0).sort((a, b) => b.total - a.total);
  let offset = 0;
  const stops = totals.map((category) => { const start = offset; offset += (category.total / spent) * 100; return `${category.color} ${start}% ${offset}%`; });
  $('#categoryDonut').style.background = spent ? `conic-gradient(${stops.join(', ')})` : 'conic-gradient(#334155 0 100%)';
  $('#categoryLegend').innerHTML = totals.slice(0, 6).map((category) => `<div class="legend-item"><span class="legend-name"><i class="legend-swatch" style="background:${category.color}"></i>${category.name}</span><span class="legend-value">${Math.round(category.total / spent * 100)}%</span></div>`).join('');
}

function renderExpenseRows(target, query = '', filter = activeFilter) {
  if (!target) return;
  const normalized = query.trim().toLowerCase();
  const filtered = monthExpenses().filter((expense) => (filter === 'all' || expense.category === filter) && (!normalized || `${expense.description} ${expense.note} ${expense.category}`.toLowerCase().includes(normalized))).sort((a, b) => b.date.localeCompare(a.date));
  target.innerHTML = filtered.length ? filtered.map(expenseRow).join('') : `<tr><td colspan="5"><div class="empty-state">No expenses match this view.</div></td></tr>`;
  $$('.edit-expense', target).forEach((button) => button.addEventListener('click', () => openExpenseModal(button.dataset.id)));
  $$('.delete-expense', target).forEach((button) => button.addEventListener('click', () => deleteExpense(button.dataset.id)));
}

function expenseRow(expense) {
  const colorClass = expense.category === 'Food' ? 'purple' : expense.category === 'Leisure' ? 'blue' : expense.category === 'Utilities' ? 'amber' : expense.category === 'Health' ? 'pink' : '';
  return `<tr class="expense-row"><td><div class="expense-name"><span class="expense-symbol ${colorClass}">${categoryIcon(expense.category)}</span><span>${escapeHtml(expense.description)}<small>${escapeHtml(expense.note || 'Personal expense')}</small></span></div></td><td><span class="category-tag"><i style="background:${categoryColor(expense.category)}"></i>${escapeHtml(expense.category)}</span></td><td><span class="date-copy">${dateLabel(expense.date)}</span></td><td class="align-right"><span class="amount-copy">${money(Number(expense.amount))}</span></td><td><div class="row-actions"><button class="row-action edit-expense" data-id="${expense.id}" type="button">Edit</button><button class="row-action delete delete-expense" data-id="${expense.id}" type="button">Remove</button></div></td></tr>`;
}

function renderBudgetList() {
  const sorted = state.categories.map((category) => ({ ...category, spent: sumByCategory(category.name), budget: Number(budgetsForMonth()[category.name] || 0) })).sort((a, b) => (b.spent / Math.max(b.budget, 1)) - (a.spent / Math.max(a.budget, 1)));
  $('#budgetList').innerHTML = sorted.slice(0, 4).map(budgetEntry).join('');
  const mover = sorted[0];
  if (mover) { $('#budgetCalloutTitle').textContent = `${mover.name} is your fastest mover`; $('#budgetCalloutCopy').textContent = `${Math.round(mover.spent / Math.max(mover.budget, 1) * 100)}% of its monthly limit is already allocated.`; }
}

function budgetEntry(item) {
  const percent = item.budget ? Math.round(item.spent / item.budget * 100) : 0;
  const width = Math.min(percent, 100);
  const tone = percent >= 100 ? 'danger' : percent >= 75 ? 'warning' : '';
  return `<div class="budget-entry"><div class="budget-meta"><span class="budget-name"><i style="background:${item.color}"></i>${escapeHtml(item.name)}</span><span class="budget-amount">${money(item.spent)} / ${money(item.budget)}</span></div><span class="budget-percent">${percent}%</span><div class="budget-bar"><div class="budget-fill ${tone}" style="width:${width}%"></div></div></div>`;
}

function renderOverviewFilters() {
  const target = $('#filterChips');
  if (!target) return;
  target.innerHTML = ['all', ...state.categories.map((category) => category.name)].map((filter) => `<button class="filter-chip ${activeFilter === filter ? 'active' : ''}" data-filter="${escapeAttribute(filter)}" type="button">${filter === 'all' ? 'All activity' : escapeHtml(filter)}${filter === 'all' ? ` <span id="allCount">${monthExpenses().length}</span>` : ''}</button>`).join('');
  $$('.filter-chip', target).forEach((button) => button.addEventListener('click', () => { activeFilter = button.dataset.filter; render(); }));
}

function renderTransactionTools() {
  const chips = $('#transactionFilterChips');
  if (!chips) return;
  chips.innerHTML = ['all', ...state.categories.map((category) => category.name)].map((filter) => `<button class="filter-chip ${activeFilter === filter ? 'active' : ''}" data-filter="${escapeAttribute(filter)}" type="button">${filter === 'all' ? 'All activity' : escapeHtml(filter)}</button>`).join('');
  $$('.filter-chip', chips).forEach((button) => button.addEventListener('click', () => { activeFilter = button.dataset.filter; render(); }));
  renderExpenseRows($('#transactionRows'), $('#transactionSearch')?.value || '');
}

function renderBudgetOverview() {
  const target = $('#budgetOverview');
  if (!target) return;
  target.innerHTML = state.categories.map((category) => { const spent = sumByCategory(category.name); const budget = Number(budgetsForMonth()[category.name] || 0); const percent = budget ? Math.round(spent / budget * 100) : 0; const tone = percent >= 100 ? 'danger' : percent >= 75 ? 'warning' : ''; return `<article class="budget-card"><div class="budget-card-head"><h3><span class="legend-swatch" style="display:inline-block;background:${category.color};margin-right:8px"></span>${escapeHtml(category.name)}</h3><button class="budget-edit" data-budget-category="${escapeAttribute(category.name)}" type="button">Edit limit</button></div><div class="budget-large">${money(spent)} <small>of ${money(budget)}</small></div><div class="budget-bar"><div class="budget-fill ${tone}" style="width:${Math.min(percent,100)}%"></div></div><div class="budget-card-foot"><span>${percent}% used</span><span>${money(Math.max(budget - spent, 0))} available</span></div></article>`; }).join('');
  $$('.budget-edit', target).forEach((button) => button.addEventListener('click', () => { const category = button.dataset.budgetCategory; const value = window.prompt(`Set ${monthLabel(state.selectedMonth)} budget for ${category}`, budgetsForMonth()[category]); const amount = Number(value); if (value !== null && Number.isFinite(amount) && amount > 0) { budgetsForMonth()[category] = Math.round(amount * 100) / 100; persist(); render(); showToast(`${category} budget updated for ${monthName(state.selectedMonth)}.`); } else if (value !== null) showToast('Enter a positive budget amount.'); }));
}

function renderCategoryGrid() {
  const target = $('#categoryGrid');
  if (!target) return;
  target.innerHTML = state.categories.map((category) => { const total = sumByCategory(category.name); const count = monthExpenses().filter((expense) => expense.category === category.name).length; const budget = budgetsForMonth()[category.name] || 0; return `<article class="category-card" style="--category-color:${category.color}"><div class="category-card-top"><h3><span class="legend-swatch" style="display:inline-block;background:${category.color};margin-right:8px"></span>${escapeHtml(category.name)}</h3><span class="category-count">${count} ${count === 1 ? 'entry' : 'entries'}</span></div><div class="category-card-total">${money(total)}</div><div class="category-card-meta"><span>${budget ? `${Math.round(total / budget * 100)}% of budget` : 'No budget set'}</span><strong>${money(budget)} limit</strong></div></article>`; }).join('');
}

function renderReports(expenses, spent, budget) {
  const target = $('#reportGrid');
  if (!target) return;
  const previous = state.expenses.filter((expense) => expense.date.startsWith(previousMonthKey(state.selectedMonth))).reduce((sum, expense) => sum + Number(expense.amount), 0);
  const delta = ((spent - previous) / previous) * 100;
  const rows = state.categories.map((category) => ({ name: category.name, spent: sumByCategory(category.name), budget: Number(budgetsForMonth()[category.name] || 0) })).filter((row) => row.spent > 0).sort((a, b) => b.spent - a.spent);
  target.innerHTML = `<article class="report-card"><div class="report-card-label">TOTAL OUTFLOW</div><div class="report-metric">${money(spent)}</div><div class="report-note">${Number.isFinite(delta) ? `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% compared with ${monthName(previousMonthKey(state.selectedMonth))}.` : 'No prior-month baseline yet.'}</div></article><article class="report-card"><div class="report-card-label">BUDGET PERFORMANCE</div><div class="report-metric">${budget ? Math.round(spent / budget * 100) : 0}%</div><div class="report-note">${money(Math.max(budget - spent, 0))} remains available across all limits.</div></article><article class="report-card"><div class="report-card-label">ENTRIES REVIEWED</div><div class="report-metric">${expenses.length}</div><div class="report-note">Validated ledger entries in ${monthLabel(state.selectedMonth)}.</div></article><article class="report-card report-card-wide"><div class="report-card-label">CATEGORY BREAKDOWN</div><div class="report-table">${rows.map((row) => `<div class="report-table-row"><span>${escapeHtml(row.name)}</span><span>${money(row.spent)}</span><span class="report-status">${row.budget && row.spent <= row.budget ? 'Within limit' : 'Review'}</span></div>`).join('')}</div></article><article class="report-card"><div class="report-card-label">READOUT</div><h3 style="margin-top:18px">${rows[0] ? `${escapeHtml(rows[0].name)} leads this month.` : 'No entries in this month yet.'}</h3><div class="report-note">${rows[0] ? `${escapeHtml(rows[0].name)} is the largest line, while ${escapeHtml(rows[rows.length - 1]?.name || 'your categories')} is the smallest active line. Review the report before the next monthly reset.` : 'Add an expense to generate a monthly readout.'}</div></article>`;
}

function fillCategoryOptions() {
  const select = $('#expenseCategory');
  if (!select) return;
  const current = select.value;
  select.innerHTML = state.categories.map((category) => `<option value="${escapeAttribute(category.name)}">${escapeHtml(category.name)}</option>`).join('');
  if (current && state.categories.some((category) => category.name === current)) select.value = current;
}

function switchSection(section) {
  activeSection = section;
  $$('.page-section').forEach((item) => item.classList.toggle('active', item.dataset.section === section));
  $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.nav === section));
  $('#breadcrumbCurrent').textContent = section[0].toUpperCase() + section.slice(1);
  history.replaceState({}, '', section === 'overview' ? '/' : `/${section}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openExpenseModal(id = '') {
  const expense = state.expenses.find((item) => item.id === id);
  $('#expenseId').value = expense?.id || '';
  $('#modalTitle').textContent = expense ? 'Edit an expense' : 'Add an expense';
  $('#saveExpense').textContent = expense ? 'Save changes' : 'Save expense';
  $('#expenseDescription').value = expense?.description || '';
  $('#expenseAmount').value = expense?.amount || '';
  $('#expenseDate').value = expense?.date || `${state.selectedMonth}-24`;
  $('#expenseCategory').value = expense?.category || state.categories[0]?.name || '';
  $('#expenseNote').value = expense?.note || '';
  clearErrors();
  $('#expenseModal').classList.add('open');
  $('#expenseModal').setAttribute('aria-hidden', 'false');
  setTimeout(() => $('#expenseDescription').focus(), 100);
}
function closeExpenseModal() { $('#expenseModal').classList.remove('open'); $('#expenseModal').setAttribute('aria-hidden', 'true'); }
function clearErrors() { $$('.field').forEach((field) => field.classList.remove('invalid')); $$('.field-error').forEach((error) => error.textContent = ''); }
function setError(inputId, errorId, message) { const input = $(`#${inputId}`); input.closest('.field').classList.add('invalid'); $(`#${errorId}`).textContent = message; }

function validateExpense() {
  clearErrors();
  const description = $('#expenseDescription').value.trim();
  const amount = Number($('#expenseAmount').value);
  const date = $('#expenseDate').value;
  const category = $('#expenseCategory').value;
  let valid = true;
  const [year, month, day] = date.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, (month || 1) - 1, day || 1));
  const isCalendarDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && parsedDate.getUTCFullYear() === year && parsedDate.getUTCMonth() === month - 1 && parsedDate.getUTCDate() === day;
  if (!description) { setError('expenseDescription', 'descriptionError', 'Add a description so the line has a reason.'); valid = false; }
  if (!Number.isFinite(amount) || amount <= 0) { setError('expenseAmount', 'amountError', 'Enter an amount greater than $0.'); valid = false; }
  if (!isCalendarDate) { setError('expenseDate', 'dateError', 'Choose a valid date.'); valid = false; }
  else if (!date.startsWith(state.selectedMonth)) { setError('expenseDate', 'dateError', `Use a date in ${monthLabel(state.selectedMonth)}.`); valid = false; }
  if (!category) { setError('expenseCategory', 'categoryError', 'Choose a category.'); valid = false; }
  return valid ? { description, amount: Math.round(amount * 100) / 100, date, category, note: $('#expenseNote').value.trim() } : null;
}

function saveExpense(event) {
  event.preventDefault();
  const values = validateExpense();
  if (!values) return;
  const id = $('#expenseId').value;
  if (id) { state.expenses = state.expenses.map((expense) => expense.id === id ? { ...expense, ...values } : expense); showToast('Expense updated.'); } else { state.expenses.push({ id: `e${Date.now()}`, ...values }); showToast('Expense saved to the ledger.'); }
  persist(); closeExpenseModal(); render();
}

function deleteExpense(id) {
  const expense = state.expenses.find((item) => item.id === id);
  if (!expense || !window.confirm(`Remove “${expense.description}” from the ledger?`)) return;
  state.expenses = state.expenses.filter((item) => item.id !== id); persist(); render(); showToast('Expense removed.');
}

function exportReport() {
  const rows = [['Description', 'Category', 'Date', 'Amount', 'Note'], ...monthExpenses().map((expense) => [expense.description, expense.category, expense.date, Number(expense.amount).toFixed(2), expense.note || ''])];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = `expense-tracker-${state.selectedMonth}.csv`; link.click(); URL.revokeObjectURL(link.href); showToast(`${monthLabel(state.selectedMonth)} report exported.`);
}

function addCategory() {
  const name = window.prompt('Name your new category');
  if (!name?.trim()) return;
  const normalized = name.trim().replace(/\s+/g, ' ');
  if (state.categories.some((category) => category.name.toLowerCase() === normalized.toLowerCase())) { showToast('That category already exists.'); return; }
  const colors = ['#fb7185', '#34d399', '#fbbf24', '#818cf8', '#c084fc'];
  state.categories.push({ id: normalized.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: normalized, color: colors[state.categories.length % colors.length] });
  Object.values(state.budgetsByMonth).forEach((budgets) => { budgets[normalized] = 300; });
  persist(); render(); showToast(`${normalized} category added.`);
}

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
function escapeAttribute(value) { return escapeHtml(value); }

$$('[data-nav]').forEach((button) => button.addEventListener('click', () => switchSection(button.dataset.nav)));
$$('[data-open-expense]').forEach((button) => button.addEventListener('click', () => openExpenseModal()));
$('#openAddExpense').addEventListener('click', () => openExpenseModal());
$('#closeModal').addEventListener('click', closeExpenseModal);
$('#cancelModal').addEventListener('click', closeExpenseModal);
$('#expenseModal').addEventListener('click', (event) => { if (event.target.id === 'expenseModal') closeExpenseModal(); });
$('#expenseForm').addEventListener('submit', saveExpense);
$('#expenseSearch').addEventListener('input', (event) => renderExpenseRows($('#expenseRows'), event.target.value));
$('#transactionSearch').addEventListener('input', (event) => renderExpenseRows($('#transactionRows'), event.target.value));
$('#searchFocus').addEventListener('click', () => { switchSection('transactions'); setTimeout(() => $('#transactionSearch').focus(), 120); });
$('#exportReport').addEventListener('click', exportReport);
$('#reportExport').addEventListener('click', exportReport);
$('#monthSwitcher').addEventListener('click', () => { state.selectedMonth = state.selectedMonth === '2026-10' ? '2026-09' : '2026-10'; activeFilter = 'all'; persist(); render(); showToast(`Showing ${monthLabel(state.selectedMonth)}.`); });
$('#addCategory').addEventListener('click', addCategory);
$('#resetBudgets').addEventListener('click', () => { if (window.confirm(`Restore the original ${monthName(state.selectedMonth)} limits?`)) { state.budgetsByMonth[state.selectedMonth] = structuredClone(seed.budgets); persist(); render(); showToast(`${monthName(state.selectedMonth)} limits restored.`); } });

const initialRoute = { '/transactions': 'transactions', '/budgets': 'budgets', '/categories': 'categories', '/reports': 'reports' }[window.location.pathname] || 'overview';
render();
switchSection(initialRoute);
