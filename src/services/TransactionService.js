import Transaction from '../models/Transaction';

let transactions = []; // simule une BDD ou AsyncStorage

export const addTransaction = (txData) => {
  const newTx = new Transaction(txData);
  transactions.push(newTx);
  return newTx;
};

export const getAllTransactions = () => {
  return transactions;
};

export const getTransactionsByType = (type) => {
  return transactions.filter((tx) => tx.type === type);
};

export const getTransactionsForWeek = (startDate) => {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return transactions.filter((tx) => tx.date >= startDate && tx.date <= endDate);
};

export const resetTransactions = () => {
  transactions = [];
};
