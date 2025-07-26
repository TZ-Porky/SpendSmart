import { startOfWeek, addDays, isSameDay } from 'date-fns';

export const getWeeklyStats = (transactions, type = 'expense') => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const result = Array(7).fill(0);

  transactions.forEach((tx) => {
    if (tx.type !== type) return;
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      if (isSameDay(new Date(tx.date), day)) {
        result[i] += tx.amount;
      }
    }
  });

  return result;
};

export const getCategorySummary = (transactions, type = 'expense') => {
  const summary = {};

  transactions
    .filter((tx) => tx.type === type)
    .forEach((tx) => {
      if (!summary[tx.category]) {
        summary[tx.category] = 0;
      }
      summary[tx.category] += tx.amount;
    });

  return Object.entries(summary).map(([category, amount]) => ({
    category,
    amount,
  }));
};
