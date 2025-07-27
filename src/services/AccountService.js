// Importations
import firestore from '@react-native-firebase/firestore';
import Account from '../models/Account';

class AccountService {

  // Référence à la collection d'un utilisateur
  _usersCollection = firestore().collection('users');

  // Récupère la sous-collection 'accounts' pour un utilisateur spécifique
  _getAccountsCollection(uid) {
    return this._usersCollection.doc(uid).collection('accounts');
  }

  // Ajoute un nouveau compte utilisateur
  async addAccount(uid, account) {
    try {
      if (!(account instanceof Account) || account.uid !== uid) {
        throw new Error('Invalid account object or UID mismatch.');
      }
      const docRef = await this._getAccountsCollection(uid).add(
        account.toFirestore(),
      );
      account.id = docRef.id;
      console.log(`Account ${account.id} added for user ${uid}.`);
      return account;
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  }

  // Récupère tous les comptes d'un utilisateur
  async getAccounts(uid) {
    try {
      const snapshot = await this._getAccountsCollection(uid)
        .orderBy('createdAt', 'asc')
        .get();
      const accounts = snapshot.docs.map(doc =>
        Account.fromFirestore(doc.data(), doc.id),
      );
      console.log(`Fetched ${accounts.length} accounts for user ${uid}.`);
      return accounts;
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }

  // Récupère un compte spécique
  async getAccount(uid, accountId) {
    try {
      const doc = await this._getAccountsCollection(uid).doc(accountId).get();
      if (doc.exists) {
        return Account.fromFirestore(doc.data(), doc.id);
      }
      console.log(`Account ${accountId} not found for user ${uid}.`);
      return null;
    } catch (error) {
      console.error('Error getting account:', error);
      throw error;
    }
  }

  // Met à jour un compte existant
  async updateAccount(uid, accountId, updates) {
    try {
      await this._getAccountsCollection(uid)
        .doc(accountId)
        .update({
          ...updates,
          lastUpdated: firestore.Timestamp.fromDate(new Date()),
        });
      console.log(`Account ${accountId} updated for user ${uid}.`);
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  
  // Met à jour le solde actuel d'un compte.
  // ! PRECAUTION: il est préférable de laisser les transactions gérer les soldes.
  async updateAccountBalance(uid, accountId, amountChange) {
    try {
      const accountRef = this._getAccountsCollection(uid).doc(accountId);
      await accountRef.update({
        currentBalance: firestore.FieldValue.increment(amountChange),
        lastUpdated: firestore.Timestamp.fromDate(new Date()),
      });
      console.log(
        `Account ${accountId} balance updated by ${amountChange} for user ${uid}.`,
      );
    } catch (error) {
      console.error('Error updating account balance:', error);
      throw error;
    }
  }

  // Supprime un compte
  async deleteAccount(uid, accountId) {
    try {
      await this._getAccountsCollection(uid).doc(accountId).delete();
      console.log(`Account ${accountId} deleted for user ${uid}.`);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  // Écoute les changements sur les comptes d'un utilisateur en temps réel.
  listenToAccounts(uid, callback) {
    const unsubscribe = this._getAccountsCollection(uid)
      .orderBy('name', 'asc')
      .onSnapshot(
        snapshot => {
          const accounts = snapshot.docs.map(doc =>
            Account.fromFirestore(doc.data(), doc.id),
          );
          callback(accounts);
        },
        error => {
          console.error('Error listening to accounts:', error);
          callback([]);
        },
      );
    return unsubscribe;
  }
}

export const accountService = new AccountService();
