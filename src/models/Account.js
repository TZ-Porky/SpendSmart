// src/models/Account.js

import firestore from '@react-native-firebase/firestore';

class Account {
  /**
   * @param {string} uid - L'UID de l'utilisateur propriétaire du compte.
   * @param {string} name - Le nom du compte (ex: "Compte Courant", "Épargne").
   * @param {'checking' | 'savings' | 'cash' | 'credit_card' | 'investment' | 'other'} type - Le type de compte.
   * @param {number} initialBalance - Le solde initial du compte.
   * @param {string} [id=''] - L'ID du document Firestore.
   * @param {Date} [createdAt=new Date()] - La date de création du compte.
   * @param {Date} [lastUpdated=new Date()] - La date de la dernière mise à jour du compte.
   * @param {number} [currentBalance] - Le solde actuel du compte (peut être calculé ou stocké).
   * @param {boolean} [isDefault=false] - Indique si c'est le compte par défaut.
   */
  constructor(
    uid,
    name,
    type,
    initialBalance,
    id = '',
    createdAt = new Date(),
    lastUpdated = new Date(),
    currentBalance = initialBalance, // Initialisé avec initialBalance par défaut
    isDefault = false
  ) {
    if (!uid || !name || !type || typeof initialBalance !== 'number') {
      throw new Error("Account requires uid, name, type, and initialBalance.");
    }
    const validTypes = ['checking', 'savings', 'cash', 'credit_card', 'investment', 'other'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid account type: ${type}. Must be one of ${validTypes.join(', ')}.`);
    }

    this.id = id;
    this.uid = uid;
    this.name = name;
    this.type = type;
    this.initialBalance = initialBalance;
    this.currentBalance = currentBalance; // Ce champ sera mis à jour dynamiquement
    this.createdAt = createdAt;
    this.lastUpdated = lastUpdated;
    this.isDefault = isDefault;
  }

  /**
   * Crée une instance de Account à partir d'un document Firestore.
   * @param {Object} docData - Les données brutes d'un document Firestore.
   * @param {string} id - L'ID du document Firestore.
   * @returns {Account}
   */
  static fromFirestore(docData, id) {
    if (!docData) {
      throw new Error("Document data cannot be null or undefined.");
    }
    return new Account(
      docData.uid,
      docData.name,
      docData.type,
      docData.initialBalance,
      id,
      docData.createdAt ? docData.createdAt.toDate() : new Date(),
      docData.lastUpdated ? docData.lastUpdated.toDate() : new Date(),
      docData.currentBalance !== undefined ? docData.currentBalance : docData.initialBalance,
      docData.isDefault || false
    );
  }

  /**
   * Convertit l'instance Account en un objet JavaScript plat pour Firestore.
   * @returns {Object} Un objet compatible avec Firestore.
   */
  toFirestore() {
    return {
      uid: this.uid,
      name: this.name,
      type: this.type,
      initialBalance: this.initialBalance,
      currentBalance: this.currentBalance,
      createdAt: firestore.Timestamp.fromDate(this.createdAt),
      lastUpdated: firestore.Timestamp.fromDate(new Date()), // Toujours la date/heure actuelle
      isDefault: this.isDefault,
    };
  }
}

export default Account;