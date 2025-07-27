// src/models/Budget.js

import firestore from '@react-native-firebase/firestore';

class Budget {
  /**
   * @param {string} uid - L'UID de l'utilisateur propriétaire du budget.
   * @param {string} name - Le nom du budget (ex: "Budget Mensuel Alimentation").
   * @param {number} amount - Le montant total alloué à ce budget.
   * @param {Date} startDate - La date de début du budget.
   * @param {Date} endDate - La date de fin du budget.
   * @param {'monthly' | 'weekly' | 'custom'} frequency - La fréquence du budget.
   * @param {string} [id=''] - L'ID du document Firestore.
   * @param {string[]} [categoryIds=[]] - Liste des IDs des catégories concernées par ce budget.
   * @param {Date} [createdAt=new Date()] - Date de création du budget.
   * @param {Date} [lastUpdated=new Date()] - Date de la dernière mise à jour.
   * @param {boolean} [isActive=true] - Indique si le budget est actif.
   */
  constructor(
    uid,
    name,
    amount,
    startDate,
    endDate,
    frequency,
    id = '',
    categoryIds = [],
    createdAt = new Date(),
    lastUpdated = new Date(),
    isActive = true
  ) {
    if (!uid || !name || typeof amount !== 'number' || !startDate || !endDate || !frequency) {
      throw new Error("Budget requires uid, name, amount, startDate, endDate, and frequency.");
    }
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      throw new Error("startDate and endDate must be Date objects.");
    }
    const validFrequencies = ['monthly', 'weekly', 'custom'];
    if (!validFrequencies.includes(frequency)) {
      throw new Error(`Invalid frequency: ${frequency}. Must be one of ${validFrequencies.join(', ')}.`);
    }

    this.id = id;
    this.uid = uid;
    this.name = name;
    this.amount = amount;
    this.startDate = startDate;
    this.endDate = endDate;
    this.frequency = frequency;
    this.categoryIds = categoryIds;
    this.createdAt = createdAt;
    this.lastUpdated = lastUpdated;
    this.isActive = isActive;
  }

  /**
   * Crée une instance de Budget à partir d'un document Firestore.
   * @param {Object} docData - Les données brutes d'un document Firestore.
   * @param {string} id - L'ID du document Firestore.
   * @returns {Budget}
   */
  static fromFirestore(docData, id) {
    if (!docData) {
      throw new Error("Document data cannot be null or undefined.");
    }
    return new Budget(
      docData.uid,
      docData.name,
      docData.amount,
      docData.startDate ? docData.startDate.toDate() : new Date(),
      docData.endDate ? docData.endDate.toDate() : new Date(),
      docData.frequency,
      id,
      docData.categoryIds || [],
      docData.createdAt ? docData.createdAt.toDate() : new Date(),
      docData.lastUpdated ? docData.lastUpdated.toDate() : new Date(),
      docData.isActive !== undefined ? docData.isActive : true
    );
  }

  /**
   * Convertit l'instance Budget en un objet JavaScript plat pour Firestore.
   * @returns {Object} Un objet compatible avec Firestore.
   */
  toFirestore() {
    return {
      uid: this.uid,
      name: this.name,
      amount: this.amount,
      startDate: firestore.Timestamp.fromDate(this.startDate),
      endDate: firestore.Timestamp.fromDate(this.endDate),
      frequency: this.frequency,
      categoryIds: this.categoryIds,
      createdAt: firestore.Timestamp.fromDate(this.createdAt),
      lastUpdated: firestore.Timestamp.fromDate(new Date()),
      isActive: this.isActive,
    };
  }
}

export default Budget;