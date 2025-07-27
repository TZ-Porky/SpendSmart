// src/models/Transaction.js

import firestore from '@react-native-firebase/firestore';

class Transaction {
  /**
   * @param {string} uid - L'identifiant unique de l'utilisateur.
   * @param {string} accountId - L'ID du compte d'où provient ou va la transaction.
   * @param {number} amount - Le montant de la transaction. Positif pour revenu/transfert entrant, négatif pour dépense/transfert sortant.
   * @param {string} description - Une brève description.
   * @param {'income' | 'expense' | 'transfer'} type - Le type de transaction.
   * @param {string} category - La catégorie de la transaction (si applicable, null pour transferts simples).
   * @param {Date} [date=new Date()] - La date de la transaction.
   * @param {string} [id=''] - L'ID de la transaction (Firestore).
   * @param {string} [detail=''] - Détail supplémentaire (ex: "Paiement de Victoire", "Taxi Nyango").
   * @param {string} [transferToAccountId=''] - L'ID du compte de destination si c'est un transfert.
   */
  constructor(
    uid,
    accountId,
    amount,
    description,
    type,
    category, // Peut être null pour les transferts
    date = new Date(),
    id = '',
    detail = '',
    transferToAccountId = ''
  ) {
    if (!uid || !accountId || typeof amount !== 'number' || !description || !type) {
      throw new Error("Transaction requires uid, accountId, amount, description, and type.");
    }
    const validTypes = ['income', 'expense', 'transfer'];
    if (!validTypes.includes(type)) {
      throw new Error(`Transaction type must be one of ${validTypes.join(', ')}.`);
    }
    if (type !== 'transfer' && !category) {
      throw new Error("Non-transfer transactions require a category.");
    }
    if (type === 'transfer' && !transferToAccountId) {
        throw new Error("Transfer transactions require a transferToAccountId.");
    }
    if (!(date instanceof Date)) {
      throw new Error("Date must be a Date object.");
    }

    this.id = id;
    this.uid = uid;
    this.accountId = accountId;
    this.amount = amount; // Négatif pour les dépenses
    this.description = description;
    this.type = type;
    this.category = category;
    this.date = date;
    this.detail = detail;
    this.transferToAccountId = transferToAccountId; // Seulement si type === 'transfer'
  }

  /**
   * Crée une instance de Transaction à partir d'un document Firestore.
   * @param {Object} docData - Les données brutes d'un document Firestore.
   * @param {string} id - L'ID du document Firestore.
   * @returns {Transaction}
   */
  static fromFirestore(docData, id) {
    if (!docData) {
      throw new Error("Document data cannot be null or undefined.");
    }
    return new Transaction(
      docData.uid,
      docData.accountId,
      docData.amount,
      docData.description,
      docData.type,
      docData.category || null, // Peut être null
      docData.date ? docData.date.toDate() : new Date(),
      id,
      docData.detail || '',
      docData.transferToAccountId || ''
    );
  }

  /**
   * Convertit l'instance Transaction en un objet JavaScript plat pour Firestore.
   * @returns {Object} Un objet compatible avec Firestore.
   */
  toFirestore() {
    const data = {
      uid: this.uid,
      accountId: this.accountId,
      amount: this.amount,
      description: this.description,
      type: this.type,
      date: firestore.Timestamp.fromDate(this.date),
      detail: this.detail,
    };
    if (this.category) {
        data.category = this.category;
    }
    if (this.type === 'transfer' && this.transferToAccountId) {
        data.transferToAccountId = this.transferToAccountId;
    }
    return data;
  }

  // Les méthodes isIncome(), isExpense() pourraient être renommées ou complétées pour isTransfer()
  isIncome() {
    return this.type === 'income';
  }

  isExpense() {
    return this.type === 'expense';
  }

  isTransfer() {
    return this.type === 'transfer';
  }
}

export default Transaction;