// Importation
import firestore from '@react-native-firebase/firestore';

// Modèles
import BalanceSummary from '../models/BalanceSummary';

class BalanceService {
  _usersCollection = firestore().collection('users');

  // Récupère le résumé du solde pour un utilisateur.
  async getBalanceSummary(uid) {
    try {
      const doc = await this._usersCollection.doc(uid).get();
      if (doc.exists && doc.data()) {
        return BalanceSummary.fromFirestore(doc.data(), doc.id);
      }
      console.log(`Balance summary not found for user ${uid}.`);
      return null;
    } catch (error) {
      console.error("Error getting balance summary:", error);
      throw error;
    }
  }

  // Crée un document de résumé de solde initial pour un nouvel utilisateur.
  // ! Ceci est généralement appelé lors de la création du compte utilisateur.
  async createInitialBalanceSummary(uid) {
    try {
      const initialSummary = new BalanceSummary(uid);
      await this._usersCollection.doc(uid).set(initialSummary.toFirestore(), { merge: true });
      console.log(`Initial balance summary created for user ${uid}.`);
    } catch (error) {
      console.error("Error creating initial balance summary:", error);
      throw error;
    }
  }

  // Écoute les changements sur le résumé du solde d'un utilisateur en temps réel.
  listenToBalanceSummary(uid, callback) {
    const unsubscribe = this._usersCollection.doc(uid).onSnapshot(
      (docSnapshot) => {
        if (docSnapshot.exists && docSnapshot.data()) {
          callback(BalanceSummary.fromFirestore(docSnapshot.data(), docSnapshot.id));
        } else {
          console.warn(`User document or balance data not found for ${uid}, returning default BalanceSummary.`);
          callback(new BalanceSummary(uid)); // Retourne un résumé par défaut
        }
      },
      (error) => {
        console.error("Error listening to balance summary:", error);
        callback(null);
      }
    );
    return unsubscribe;
  }
}

export const balanceService = new BalanceService();