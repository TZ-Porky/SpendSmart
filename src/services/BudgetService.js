// Importations
import firestore from '@react-native-firebase/firestore';

// Modèles
import Budget from '../models/Budget';

class BudgetService {
  _usersCollection = firestore().collection('users');

  // Crée une référence à la sous-collection 'budgets' pour un utilisateur spécifique.
  _getBudgetsCollection(uid) {
    return this._usersCollection.doc(uid).collection('budgets');
  }

  // Ajoute un nouveau budget pour un utilisateur.
  async addBudget(uid, budget) {
    try {
      if (!(budget instanceof Budget) || budget.uid !== uid) {
        throw new Error('Invalid budget object or UID mismatch.');
      }
      const docRef = await this._getBudgetsCollection(uid).add(
        budget.toFirestore(),
      );
      budget.id = docRef.id;
      console.log(`Budget ${budget.id} added for user ${uid}.`);
      return budget;
    } catch (error) {
      console.error('Error adding budget:', error);
      throw error;
    }
  }

  // Récupère tous les budgets d'un utilisateur
  async getBudgets(uid) {
    try {
      const snapshot = await this._getBudgetsCollection(uid)
        .orderBy('startDate', 'desc')
        .get();
      const budgets = snapshot.docs.map(doc =>
        Budget.fromFirestore(doc.data(), doc.id),
      );
      console.log(`Fetched ${budgets.length} budgets for user ${uid}.`);
      return budgets;
    } catch (error) {
      console.error('Error getting budgets:', error);
      throw error;
    }
  }

  // Met à jour un budget existant.
  async updateBudget(uid, budgetId, updates) {
    try {
      await this._getBudgetsCollection(uid)
        .doc(budgetId)
        .update({
          ...updates,
          lastUpdated: firestore.Timestamp.fromDate(new Date()),
        });
      console.log(`Budget ${budgetId} updated for user ${uid}.`);
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  // Supprime un budget
  async deleteBudget(uid, budgetId) {
    try {
      await this._getBudgetsCollection(uid).doc(budgetId).delete();
      console.log(`Budget ${budgetId} deleted for user ${uid}.`);
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  // Écoute les changements sur les budgets d'un utilisateur en temps réel.
  listenToBudgets(uid, callback) {
    const unsubscribe = this._getBudgetsCollection(uid)
      .orderBy('startDate', 'desc')
      .onSnapshot(
        snapshot => {
          const budgets = snapshot.docs.map(doc =>
            Budget.fromFirestore(doc.data(), doc.id),
          );
          callback(budgets);
        },
        error => {
          console.error('Error listening to budgets:', error);
          callback([]);
        },
      );
    return unsubscribe;
  }
}

export const budgetService = new BudgetService();
