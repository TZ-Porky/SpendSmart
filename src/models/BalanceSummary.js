// src/models/BalanceSummary.js

class BalanceSummary {
    /**
     * @param {string} uid - L'identifiant unique de l'utilisateur.
     * @param {number} currentBalance - Le solde actuel de l'utilisateur.
     * @param {number} totalIncome - Le total des revenus de l'utilisateur.
     * @param {number} totalExpenses - Le total des dépenses de l'utilisateur.
     */
    constructor(uid, currentBalance = 0, totalIncome = 0, totalExpenses = 0) {
      if (!uid) {
        throw new Error("BalanceSummary requires a uid.");
      }
      if (typeof currentBalance !== 'number' || typeof totalIncome !== 'number' || typeof totalExpenses !== 'number') {
        throw new Error("Balance values must be numbers.");
      }
  
      this.uid = uid;
      this.currentBalance = currentBalance;
      this.totalIncome = totalIncome;
      this.totalExpenses = totalExpenses;
    }
  
    /**
     * Crée une instance de BalanceSummary à partir d'un document Firestore.
     * @param {Object} docData - Les données brutes d'un document Firestore.
     * @param {string} uid - L'UID de l'utilisateur (qui est l'ID du document).
     * @returns {BalanceSummary}
     */
    static fromFirestore(docData, uid) {
      if (!docData) {
        throw new Error("Document data cannot be null or undefined.");
      }
      return new BalanceSummary(
        uid,
        docData.currentBalance || 0,
        docData.totalIncome || 0,
        docData.totalExpenses || 0
      );
    }
  
    /**
     * Convertit l'instance BalanceSummary en un objet JavaScript plat pour Firestore.
     * @returns {Object} Un objet compatible avec Firestore.
     */
    toFirestore() {
      return {
        currentBalance: this.currentBalance,
        totalIncome: this.totalIncome,
        totalExpenses: this.totalExpenses,
        // L'UID n'est pas inclus car c'est l'ID du document
      };
    }
  
    /**
     * Met à jour le solde et les totaux.
     * @param {number} amount - Le montant à ajouter/soustraire du solde.
     * @param {'income' | 'expense'} type - Le type de transaction.
     */
    updateTotals(amount, type) {
      this.currentBalance += amount;
      if (type === 'income') {
        this.totalIncome += amount;
      } else if (type === 'expense') {
        this.totalExpenses += amount;
      }
    }
  
    /**
     * Calcule le solde net (revenus - dépenses).
     * @returns {number}
     */
    getNetBalance() {
      return this.totalIncome - this.totalExpenses;
    }
  }
  
  export default BalanceSummary;