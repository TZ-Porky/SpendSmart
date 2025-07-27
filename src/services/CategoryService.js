// Importations
import firestore from '@react-native-firebase/firestore';

// Modèles
import Category from '../models/Category';

// Catégories par défaut, communes à tous les utilisateurs
const defaultCategories = [
  // Dépenses
  new Category('Nourriture', 'expense', 'cat_food', 'food-fork-knife', '#FF5733'),
  new Category('Transport', 'expense', 'cat_transport', 'bus', '#337AFF'),
  new Category('Logement', 'expense', 'cat_housing', 'home', '#33FF57'),
  new Category('Divertissement', 'expense', 'cat_entertainment', 'popcorn', '#FF33DA'),
  new Category('Shopping', 'expense', 'cat_shopping', 'shopping', '#33D8FF'),
  new Category('Factures', 'expense', 'cat_bills', 'receipt', '#FFA500'),
  new Category('Santé', 'expense', 'cat_health', 'medical-bag', '#DC143C'),
  new Category('Éducation', 'expense', 'cat_education', 'school', '#8A2BE2'),
  new Category('Voyage', 'expense', 'cat_travel', 'airplane', '#00FFFF'),
  new Category('Autres Dépenses', 'expense', 'cat_other_expense', 'dots-horizontal', '#808080'),

  // Revenus
  new Category('Salaire', 'income', 'cat_salary', 'cash-multiple', '#228B22'),
  new Category('Investissement', 'income', 'cat_investment', 'chart-line', '#DAA520'),
  new Category('Cadeau', 'income', 'cat_gift', 'gift', '#FFD700'),
  new Category('Remboursement', 'income', 'cat_refund', 'cash-refund', '#4682B4'),
  new Category('Autres Revenus', 'income', 'cat_other_income', 'dots-horizontal', '#696969'),
];

class CategoryService {
  _usersCollection = firestore().collection('users');


  // Crée une référence à la sous-collection 'categories' pour un utilisateur spécifique.
  _getUserCategoriesCollection(uid) {
    return this._usersCollection.doc(uid).collection('categories');
  }

  // Récupère toutes les catégories (par défaut + personnalisées de l'utilisateur).
  async getAllCategories(uid) {
    try {
      const userCategoriesSnapshot = await this._getUserCategoriesCollection(uid).get();
      const userCategories = userCategoriesSnapshot.docs.map(doc => Category.fromFirestore(doc.data(), doc.id));

      // Combiner les catégories par défaut et les catégories personnalisées de l'utilisateur
      const allCategories = [...defaultCategories, ...userCategories];

      console.log(`Fetched ${allCategories.length} total categories for user ${uid}.`);
      return allCategories;
    } catch (error) {
      console.error("Error getting all categories:", error);
      throw error;
    }
  }

  // Ajoute une catégorie personnalisée pour un utilisateur.
  async addCustomCategory(uid, category) {
    try {
      if (!(category instanceof Category) || category.uid !== uid || !category.isUserDefined) {
        throw new Error("Invalid custom category object provided.");
      }
      const docRef = await this._getUserCategoriesCollection(uid).add(category.toFirestore());
      category.id = docRef.id;
      console.log(`Custom category ${category.id} added for user ${uid}.`);
      return category;
    } catch (error) {
      console.error("Error adding custom category:", error);
      throw error;
    }
  }

  // Met à jour une catégorie personnalisée.
  async updateCustomCategory(uid, categoryId, updates) {
    try {
      await this._getUserCategoriesCollection(uid).doc(categoryId).update(updates);
      console.log(`Custom category ${categoryId} updated for user ${uid}.`);
    } catch (error) {
      console.error("Error updating custom category:", error);
      throw error;
    }
  }

  // Supprime une catégorie personnalisée.
  async deleteCustomCategory(uid, categoryId) {
    try {
      await this._getUserCategoriesCollection(uid).doc(categoryId).delete();
      console.log(`Custom category ${categoryId} deleted for user ${uid}.`);
    } catch (error) {
      console.error("Error deleting custom category:", error);
      throw error;
    }
  }

  // Écoute les changements sur les catégories personnalisées d'un utilisateur en temps réel.
  listenToAllCategories(uid, callback) {
    const unsubscribe = this._getUserCategoriesCollection(uid).onSnapshot(
      (snapshot) => {
        const userCategories = snapshot.docs.map(doc => Category.fromFirestore(doc.data(), doc.id));
        const allCategories = [...defaultCategories, ...userCategories];
        callback(allCategories);
      },
      (error) => {
        console.error("Error listening to all categories:", error);
        callback([...defaultCategories]);
      }
    );
    return unsubscribe;
  }
}

export const categoryService = new CategoryService();