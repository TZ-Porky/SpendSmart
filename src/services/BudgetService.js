import Budget from '../models/Budget';

let budgets = [];

export const setBudget = (budgetData) => {
  const newBudget = new Budget(budgetData);
  budgets.push(newBudget);
  return newBudget;
};

export const getActiveBudgets = () => {
  return budgets.filter((b) => b.isInPeriod());
};

export const checkBudgetStatus = (budget, transactions) => {
  const filtered = transactions.filter(
    (tx) =>
      tx.isExpense() &&
      budget.appliesToCategory(tx.category) &&
      budget.isInPeriod(tx.date)
  );

  const totalSpent = filtered.reduce((sum, tx) => sum + tx.amount, 0);
  const remaining = budget.amount - totalSpent;

  return {
    totalSpent,
    remaining,
    isExceeded: remaining < 0,
    percentageUsed: Math.min(100, (totalSpent / budget.amount) * 100),
  };
};
